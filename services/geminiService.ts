import { GoogleGenAI, Chat, GenerateContentResponse, Part, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
const imageCache: Record<string, string> = {};

// Queue system definitions
interface QueueItem {
  dishName: string;
  description: string;
  resolve: (url: string | null) => void;
  retryCount: number;
}

const requestQueue: QueueItem[] = [];
let isProcessingQueue = false;

// Rate limiting constants
const RATE_LIMIT_DELAY_MS = 5000;
const BACKOFF_DELAY_MS = 20000;
const MAX_RETRIES = 3;

/**
 * Safely retrieves the API key from various environment variable sources.
 * Prevents "process is not defined" crashes in browser environments (Vite/Netlify).
 */
const getApiKey = (): string => {
  try {
    // Check for standard Node.js process.env (Create React App, etc.)
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  try {
    // Check for Vite environment variables
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
     // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.API_KEY) {
      // @ts-ignore
      return import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }
  
  return '';
};

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API Key is missing. Please check your environment variables (API_KEY or VITE_API_KEY).");
  }

  const ai = new GoogleGenAI({ apiKey });
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [
        {
          functionDeclarations: [
            {
              name: "addToCart",
              description: "Add an item to the user's shopping cart.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  dishId: { type: Type.STRING, description: "The ID of the dish to add. Must be an exact ID from the menu data." },
                  quantity: { type: Type.NUMBER, description: "The quantity of the dish to add." }
                },
                required: ["dishId", "quantity"]
              }
            }
          ]
        }
      ]
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string | Part[]): Promise<GenerateContentResponse> => {
  try {
    const chat = initializeChat();
    // @ts-ignore
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Processes the image generation queue sequentially with delays to respect rate limits.
 */
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const item = requestQueue[0];

    if (imageCache[item.dishName]) {
      item.resolve(imageCache[item.dishName]);
      requestQueue.shift();
      continue;
    }

    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Professional food photography of ${item.dishName}, ${item.description}. High resolution, appetizing, restaurant style, 4k, centered, photorealistic, warm lighting.` }
          ],
        },
        config: {
          imageConfig: {
              aspectRatio: "4:3"
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Str = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const fullUrl = `data:${mimeType};base64,${base64Str}`;
          
          imageCache[item.dishName] = fullUrl;
          item.resolve(fullUrl);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        console.warn(`No image found in response for ${item.dishName}`);
        item.resolve(null);
      }

      requestQueue.shift();
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));

    } catch (error: any) {
      const isRateLimit = 
        error.status === 429 || 
        error.code === 429 || 
        (error.error && error.error.code === 429) ||
        (error.message && error.message.includes('429')) ||
        (JSON.stringify(error).includes('429')) ||
        (JSON.stringify(error).includes('RESOURCE_EXHAUSTED'));

      if (isRateLimit) {
        if (item.retryCount < MAX_RETRIES) {
          console.warn(`Rate limit hit for ${item.dishName}. Retrying in ${BACKOFF_DELAY_MS/1000}s... (Attempt ${item.retryCount + 1}/${MAX_RETRIES})`);
          item.retryCount++;
          await new Promise(resolve => setTimeout(resolve, BACKOFF_DELAY_MS));
          continue; 
        } else {
          console.warn(`Max retries reached for ${item.dishName} due to rate limiting. Skipping image generation.`);
          item.resolve(null);
          requestQueue.shift();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.error(`Error generating image for ${item.dishName}:`, error);
        item.resolve(null);
        requestQueue.shift();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  isProcessingQueue = false;
};

export const generateDishImage = (dishName: string, description: string): Promise<string | null> => {
  if (imageCache[dishName]) {
    return Promise.resolve(imageCache[dishName]);
  }
  return new Promise((resolve) => {
    requestQueue.push({ dishName, description, resolve, retryCount: 0 });
    processQueue();
  });
};