import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onCheckout }) => {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleClose = () => {
    setIsOrderConfirmed(false);
    onClose();
  };

  const handleCheckout = () => {
    onCheckout();
    setIsOrderConfirmed(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col animate-[slideIn_0.3s_ease-out]">
        
        {isOrderConfirmed ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900">Order Confirmed!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Sit back & relax.<br/>Your food will be on the table within <span className="text-gray-900 font-semibold">10-15 mins</span>.
            </p>
            <button 
              onClick={handleClose} 
              className="w-full bg-black text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 transition active:scale-95"
            >
              Okay, Got it
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold">Your Order</h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.174 6.812-3.269 13.926A3 3 0 0 1 14.978 23H9.022a3 3 0 0 1-2.927-2.262L2.826 6.812A3 3 0 0 1 5.753 3h12.494a3 3 0 0 1 2.927 3.812Z"/><path d="M9 11V6a3 3 0 0 1 6 0v5"/></svg>
                  </div>
                  <p>Your cart is empty.</p>
                  <p className="text-sm mt-1">Add some delicious dishes!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 border-b border-gray-100 last:border-0 pb-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 font-medium">₹{item.price} x {item.quantity}</p>
                          <p className="text-sm font-bold">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition self-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-600">Total</span>
                <span className="font-bold text-xl">₹{total}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 shadow-lg" 
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CartSidebar;