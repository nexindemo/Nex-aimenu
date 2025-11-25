import React from 'react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick: () => void;
  isLightMode?: boolean;
  animateCart?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onHomeClick, isLightMode = true, animateCart = false }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm text-gray-900' : 'bg-transparent text-white'}`}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
        <div className={`p-2 rounded-full ${isLightMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg leading-tight">NexSpice Court</h1>
          <p className={`text-[10px] tracking-widest uppercase ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>Smart Dining</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className={`p-2 rounded-full transition ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        </button>
        <button 
          onClick={onCartClick} 
          className={`p-2 rounded-full relative transition duration-300 ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'} ${animateCart ? 'scale-125 bg-green-100 text-green-700' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {cartCount > 0 && (
            <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-transform ${animateCart ? 'scale-125' : 'scale-100'}`}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;