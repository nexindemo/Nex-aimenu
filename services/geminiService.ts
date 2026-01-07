
import { GoogleGenAI, Chat, GenerateContentResponse, Part, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
const imageCache: Record<string, string> = {};

interface QueueItem {
  dishName: string;
  description: string;
  resolve: (url: string | null) => void;
  retryCount: number;
}

const requestQueue: QueueItem[] = [];
let isProcessingQueue = false;

const RATE_LIMIT_DELAY_MS = 5000;
const BACKOFF_DELAY_MS = 20000;
const MAX_RETRIES = 3;

/**
 * Safely retrieves the API key from the environment variable.
 */
export const getApiKey = (): string => {
  // Fixed: Following guideline to obtain API key exclusively from process.env.API_KEY
  return process.env.API_KEY || '';
};

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
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

// Fixed: Changed any[] to Part[] for better typing
export const sendMessageToGemini = async (message: string | Part[]): Promise<GenerateContentResponse> => {
  try {
    const chat = initializeChat();
    // Wrap message in object as per SDK requirements: sendMessage only accepts { message: string | Part[] }
    const payload = { message };
    // Fixed: Removed @ts-ignore as we are now passing the correct payload structure
    const response: GenerateContentResponse = await chat.sendMessage(payload);
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    chatSession = null; // Reset session on error to recover
    throw error;
  }
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
          parts: [{ text: `Professional food photography of ${item.dishName}, ${item.description}. High resolution, appetizing, restaurant style, 4k, centered, photorealistic, warm lighting.` }],
        },
        config: { imageConfig: { aspectRatio: "4:3" } }
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
      if (!foundImage) item.resolve(null);
      requestQueue.shift();
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    } catch (error: any) {
      if (JSON.stringify(error).includes('429')) {
        if (item.retryCount < MAX_RETRIES) {
          item.retryCount++;
          await new Promise(resolve => setTimeout(resolve, BACKOFF_DELAY_MS));
          continue; 
        }
      }
      item.resolve(null);
      requestQueue.shift();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  isProcessingQueue = false;
};

// --- Live Audio Utilities ---

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
