import React from 'react';

interface HeroProps {
  onViewMenu: () => void;
  onTalkToAI: () => void;
}

const Hero: React.FC<HeroProps> = ({ onViewMenu, onTalkToAI }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80")' }}
      ></div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10 pt-20">
        
        {/* Label */}
        <div className="inline-flex items-center gap-2 border border-white/30 rounded-full px-4 py-1.5 backdrop-blur-md bg-white/10 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold tracking-widest uppercase">Nex-AI Kitchen Live</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 leading-tight">
          The Future of <br/>
          <span className="italic text-gray-200">Indian Dining.</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-300 text-sm md:text-base max-w-md mb-10 leading-relaxed">
          Authentic Indian heritage meets the precision of AI hospitality. Experience personalized dining like never before.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={onViewMenu}
            className="w-full bg-white text-black font-semibold py-4 rounded-full hover:bg-gray-100 transition shadow-lg active:scale-95"
          >
            View Menu
          </button>
          <button 
            onClick={onTalkToAI}
            className="w-full border border-white/40 text-white font-semibold py-4 rounded-full hover:bg-white/10 transition backdrop-blur-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Talk to AI Waiter
            <span className="ml-1">→</span>
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
      </div>
    </div>
  );
};

export default Hero;