
import React, { useState, useMemo, useEffect } from 'react';
import { Category, DietType, Dish } from '../types';
import { MENU_ITEMS } from '../constants';
import { generateDishImage } from '../services/geminiService';

interface MenuProps {
  onAddToCart: (dish: Dish) => void;
  onOpenChat: () => void;
}

const MenuCard: React.FC<{ item: Dish; onAdd: (dish: Dish) => void }> = ({ item, onAdd }) => {
  const [imgSrc, setImgSrc] = useState(item.image);
  const [isGenerated, setIsGenerated] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      // If we have a Drive link or Unsplash link, use it directly.
      if (item.image && (item.image.includes('drive.google.com') || item.image.includes('images.unsplash.com'))) {
        return;
      }
      
      const generatedUrl = await generateDishImage(item.name, item.description);
      if (isMounted && generatedUrl) {
        setImgSrc(generatedUrl);
        setIsGenerated(true);
      }
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [item.name, item.description, item.image]);

  const VegIcon = () => (
    <div className="w-4 h-4 border border-green-600 p-0.5 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-green-600"></div>
    </div>
  );

  const NonVegIcon = () => (
    <div className="w-4 h-4 border border-red-600 p-0.5 flex items-center justify-center">
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-red-600 border-r-[4px] border-r-transparent"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
      <div className="relative h-40 sm:h-48 w-full bg-gray-100 group overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
        <img 
          src={imgSrc} 
          alt={item.name} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => {
            // If Drive link is blocked or fails, try the lh3 direct link or fallback to Unsplash
            if (imgSrc.includes('drive.google.com')) {
               const fileId = imgSrc.split('id=')[1];
               if (fileId) {
                  setImgSrc(`https://lh3.googleusercontent.com/d/${fileId}`);
                  return;
               }
            }
            setImgSrc(`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80`);
          }}
        />
        {isGenerated && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            AI Generated
          </div>
        )}
        <button className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             {item.isBestseller && <span className="text-[10px] font-bold text-brand-gold uppercase tracking-tighter">Bestseller</span>}
          </div>
          <h3 className="font-serif font-bold text-gray-900 text-[16px] leading-tight mb-3 line-clamp-2 min-h-[40px]">{item.name}</h3>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
              {item.diet === DietType.VEG ? <VegIcon /> : <NonVegIcon />}
              <span className="font-bold text-gray-900 text-sm">₹{item.price}</span>
          </div>
          
          <button 
            onClick={() => onAdd(item)}
            className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition active:scale-90 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Menu: React.FC<MenuProps> = ({ onAddToCart, onOpenChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegMode, setIsVegMode] = useState(false);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === Category.ALL || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = isVegMode ? item.diet === DietType.VEG : true;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [selectedCategory, searchQuery, isVegMode]);

  return (
    <div className="pt-20 pb-24 px-4 bg-[#F8F9FB] min-h-screen font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search dishes..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-full border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsVegMode(!isVegMode)}
          className={`flex-shrink-0 w-12 h-12 rounded-full border shadow-sm flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isVegMode 
              ? 'bg-green-500 border-green-600 text-white' 
              : 'bg-white border-gray-200 text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          aria-label="Toggle Vegetarian Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isVegMode ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22C2 12 12 2 12 2s10 10 10 20H2z"/><path d="M2 22h20"/></svg>
        </button>
      </div>

      <div className="mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2.5">
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat 
                  ? 'bg-black text-white shadow-lg' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Our Menu</h2>
          <p className="text-gray-500 text-sm mt-1">Hand-picked dishes just for you.</p>
        </div>
        <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          {filteredItems.length} Items
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <MenuCard key={item.id} item={item} onAdd={onAddToCart} />
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={onOpenChat}
          className="bg-black text-white rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.3)] flex items-center pr-6 pl-3 py-3 gap-3 border border-gray-800 hover:scale-105 transition-transform"
        >
          <div className="relative">
             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-gray-900">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
             </div>
             <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></div>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">AI Waiter</p>
            <p className="text-sm font-semibold leading-none">Chat & Order</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Menu;
