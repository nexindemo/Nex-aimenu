
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type } from '@google/genai';
import { sendMessageToGemini, getApiKey, decodeBase64, encodeBase64, decodeAudioData } from '../services/geminiService';
import { ChatMessage, Dish } from '../types';
import { MENU_ITEMS, SYSTEM_INSTRUCTION } from '../constants';

interface ChatInterfaceProps {
  onBack: () => void;
  onAddToCart?: (dish: Dish) => void;
}

const SUGGESTIONS = [
  "What are your bestsellers?",
  "I want something spicy 🌶️",
  "Any vegan options?",
  "Best starter for two?"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, onAddToCart }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Welcome to NexSpice Court! 🍽️\n\nI'm your personal digital waiter. I can describe dishes, suggest pairings, or take your order instantly. What are you craving today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [userTranscription, setUserTranscription] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscription, userTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  const stopVoiceSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close?.();
      liveSessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
      audioContextRef.current = null;
    }
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
    setIsLiveActive(false);
    setIsVoiceMode(false);
  };

  const startVoiceSession = async () => {
    setIsVoiceMode(true);
    setIsLoading(true);
    
    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setIsLoading(false);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Data
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const { output: ctx } = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.inputTranscription) {
              setUserTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'user', text: userTranscription, timestamp: new Date() },
                { id: (Date.now()+1).toString(), role: 'model', text: liveTranscription, timestamp: new Date() }
              ]);
              setLiveTranscription('');
              setUserTranscription('');
            }

            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'addToCart' && onAddToCart) {
                  const dishId = fc.args.dishId as string;
                  const qty = (fc.args.quantity as number) || 1;
                  const dish = MENU_ITEMS.find(d => d.id === dishId);
                  if (dish) {
                    for(let i=0; i<qty; i++) onAddToCart(dish);
                    sessionPromise.then(s => s.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { result: "Success" } }
                    }));
                  }
                }
              }
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopVoiceSession(),
          onerror: (e) => {
            console.error("Live Error", e);
            stopVoiceSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          tools: [{ functionDeclarations: [
            {
              name: "addToCart",
              description: "Add an item to the cart.",
              parameters: {
                // Fixed: Added Type import and used Type enum
                type: Type.OBJECT,
                properties: { 
                  dishId: { type: Type.STRING }, 
                  quantity: { type: Type.NUMBER } 
                },
                required: ["dishId", "quantity"]
              }
            }
          ]}]
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsVoiceMode(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let response = await sendMessageToGemini(text);
      // Fixed: Simplified function call handling using response.functionCalls property
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        for (const call of response.functionCalls) {
          if (call.name === 'addToCart' && onAddToCart) {
            const dishId = call.args['dishId'] as string;
            const quantity = (call.args['quantity'] as number) || 1;
            const dish = MENU_ITEMS.find(d => d.id === dishId);
            if (dish) {
              for(let i = 0; i < quantity; i++) onAddToCart(dish);
              functionResponses.push({ 
                functionResponse: { 
                  name: call.name, 
                  response: { result: `Added ${quantity} x ${dish.name}` }, 
                  id: call.id 
                } 
              });
            }
          }
        }
        if (functionResponses.length > 0) {
          response = await sendMessageToGemini(functionResponses);
        } else {
          break;
        }
      }
      // Fixed: Accessing text output via response.text property
      const responseText = response.text || "Done!";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error connecting to kitchen.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white ${isLiveActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Nex-AI Waiter</h3>
            <p className="text-xs text-green-600 font-medium">{isVoiceMode ? 'Live Voice Active' : 'Online'}</p>
          </div>
        </div>
        
        {isVoiceMode && (
          <button 
            onClick={stopVoiceSession}
            className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition shadow-md"
          >
            END SESSION
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 transition-colors duration-500 ${isVoiceMode ? 'bg-brand-dark' : 'bg-[#F0F2F5]'}`}>
        {!isVoiceMode ? (
          <>
            <div className="text-center text-xs text-slate-400 my-4 font-medium uppercase tracking-widest">Today's Conversation</div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex mb-4 items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm text-gray-600 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /></svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4 items-end">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-2 mb-1 shadow-sm text-gray-600">
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white relative">
            {/* Pulsing Voice Visualizer */}
            <div className="relative flex items-center justify-center mb-12">
              <div className={`absolute w-40 h-40 bg-white/10 rounded-full blur-xl transition-transform duration-300 ${isLiveActive ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
              <div className={`absolute w-32 h-32 bg-white/20 rounded-full blur-lg transition-transform duration-500 ${isLiveActive ? 'scale-125' : 'scale-100'}`}></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </div>
            </div>

            <div className="text-center space-y-4 max-w-sm px-4">
              <h4 className="text-lg font-serif italic text-white/60">"I'm listening..."</h4>
              <div className="min-h-[100px] flex flex-col items-center gap-4">
                {userTranscription && (
                  <p className="text-white text-sm bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5 animate-in slide-in-from-bottom-2">
                    {userTranscription}
                  </p>
                )}
                {liveTranscription && (
                  <p className="text-brand-gold font-medium text-lg animate-in fade-in zoom-in duration-300">
                    {liveTranscription}
                  </p>
                )}
              </div>
            </div>
            
            <p className="absolute bottom-4 text-[10px] text-white/30 uppercase tracking-[0.2em]">Encrypted Live Connection</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isVoiceMode && (
        <>
          <div className="bg-[#F0F2F5] px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 transition">{s}</button>
              ))}
            </div>
          </div>
          <div className="bg-white p-3 border-t">
            <div className="flex items-center gap-2">
              <button 
                onClick={startVoiceSession}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-dark text-white hover:bg-black transition-all active:scale-95 shadow-md"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              </button>
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
                <input 
                  type="text" 
                  className="flex-1 bg-transparent focus:outline-none text-sm py-1.5 placeholder-gray-500"
                  placeholder="Type or use Voice..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                  disabled={isLoading}
                />
                <button 
                  onClick={() => handleSend(inputText)}
                  disabled={isLoading || !inputText.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 ${inputText.trim() ? 'bg-brand-dark' : 'bg-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
