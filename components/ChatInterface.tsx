import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, initializeChat } from '../services/geminiService';
import { ChatMessage, Dish } from '../types';
import { MENU_ITEMS } from '../constants';

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
      text: "Welcome to Nex-AI Bistro! 🍽️\n\nI'm your personal digital waiter. I can describe dishes, suggest pairings, or take your order instantly. What are you craving today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Send user message
      let response = await sendMessageToGemini(text);
      
      // 2. Loop to handle potential function calls
      while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
        const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
        const functionResponses = [];

        for (const part of functionCalls) {
          const call = part.functionCall!;
          console.log("AI executing tool:", call.name, call.args);

          if (call.name === 'addToCart' && onAddToCart) {
            const dishId = call.args['dishId'] as string;
            const quantity = (call.args['quantity'] as number) || 1;
            const dish = MENU_ITEMS.find(d => d.id === dishId);

            if (dish) {
              // Execute cart addition
              for(let i = 0; i < quantity; i++) {
                onAddToCart(dish);
              }
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { result: `Added ${quantity} x ${dish.name} to cart successfully.` },
                  id: call.id
                }
              });
            } else {
               functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: `Dish with ID ${dishId} not found.` },
                  id: call.id
                }
              });
            }
          }
        }

        // 3. Send tool output back to model
        if (functionResponses.length > 0) {
           // Use sendMessageToGemini to ensure consistent object wrapping
           // @ts-ignore
           response = await sendMessageToGemini(functionResponses);
        } else {
           break; // Should not happen if loop condition met
        }
      }

      // 4. Final Text Response
      const responseText = response.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || "I've processed that request.";
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: "I'm having a little trouble connecting to the kitchen system right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="relative">
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white shadow-sm">
            {/* Robot Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="10" x="3" y="11" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" x2="8" y1="16" y2="16" />
              <line x1="16" x2="16" y1="16" y2="16" />
            </svg>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-white"></div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">Nex-AI Waiter</h3>
          <p className="text-xs text-green-600 font-medium leading-tight">Typically replies instantly</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F0F2F5]">
        <div className="text-center text-xs text-slate-400 my-4 font-medium">
          Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex mb-4 items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-sm text-gray-600 mb-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="10" x="3" y="11" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" x2="8" y1="16" y2="16" />
                    <line x1="16" x2="16" y1="16" y2="16" />
                 </svg>
              </div>
            )}
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4 items-end">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-2 mb-1 shadow-sm text-gray-600">
               <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="10" x="3" y="11" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" x2="8" y1="16" y2="16" />
                  <line x1="16" x2="16" y1="16" y2="16" />
               </svg>
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 flex gap-1 items-center shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="bg-[#F0F2F5] px-4 pb-2">
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 active:scale-95 transition"
              >
                {s}
              </button>
            ))}
         </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-colors">
          <input 
            type="text" 
            className="flex-1 bg-transparent focus:outline-none text-sm py-1 placeholder-gray-500"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            disabled={isLoading}
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
          <button 
            onClick={() => handleSend(inputText)}
            disabled={isLoading || !inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 ${inputText.trim() ? 'bg-black hover:bg-gray-800' : 'bg-gray-300'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;