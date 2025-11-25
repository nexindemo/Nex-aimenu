import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Menu from './components/Menu';
import ChatInterface from './components/ChatInterface';
import CartSidebar from './components/CartSidebar';
import { CartItem, Dish } from './types';

type View = 'home' | 'menu' | 'chat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [triggerCartAnimation, setTriggerCartAnimation] = useState(false);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => 
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
    
    // Trigger animation
    setTriggerCartAnimation(true);
    setTimeout(() => setTriggerCartAnimation(false), 300);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="font-sans antialiased text-gray-900 bg-white min-h-screen">
      {/* Navigation */}
      {currentView !== 'chat' && (
        <Navbar 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)}
          onHomeClick={() => setCurrentView('home')}
          isLightMode={currentView !== 'home'}
          animateCart={triggerCartAnimation}
        />
      )}

      {/* Main Content Area */}
      <main>
        {currentView === 'home' && (
          <Hero 
            onViewMenu={() => setCurrentView('menu')}
            onTalkToAI={() => setCurrentView('chat')}
          />
        )}

        {currentView === 'menu' && (
          <Menu 
            onAddToCart={addToCart}
            onOpenChat={() => setCurrentView('chat')}
          />
        )}

        {currentView === 'chat' && (
          <ChatInterface 
            onBack={() => setCurrentView('menu')} 
            onAddToCart={addToCart}
          />
        )}
      </main>

      {/* Cart Overlay */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={removeFromCart}
        onCheckout={clearCart}
      />

    </div>
  );
};

export default App;