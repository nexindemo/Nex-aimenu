import { Category, DietType, Dish } from './types';

export const MENU_ITEMS: Dish[] = [
  // --- STARTERS ---
  {
    id: '1',
    name: 'Paneer Tandoori Tikka',
    price: 299,
    description: 'Cottage cheese cubes marinated in spiced yogurt and grilled to smoky perfection.',
    image: 'https://images.unsplash.com/photo-1567188040754-5835ece3ea97?auto=format&fit=crop&w=800&q=80',
    category: Category.STARTERS,
    diet: DietType.VEG,
    isBestseller: true
  },
  {
    id: '2',
    name: 'Crispy Corn Pepper Fry',
    price: 229,
    description: 'Golden corn kernels tossed with black pepper, onions, and curry leaves.',
    image: 'https://images.unsplash.com/photo-1623226343534-1901869e9447?auto=format&fit=crop&w=800&q=80',
    category: Category.STARTERS,
    diet: DietType.VEG
  },
  {
    id: '3',
    name: 'Chicken Malai Tikka',
    price: 319,
    description: 'Melt-in-mouth chicken chunks marinated in cream, cheese, and mild spices.',
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=800&q=80',
    category: Category.STARTERS,
    diet: DietType.NON_VEG
  },
  {
    id: '4',
    name: 'Andhra Pepper Chicken',
    price: 329,
    description: 'Spicy stir-fried chicken with a bold kick of crushed black peppercorns.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d28f2d?auto=format&fit=crop&w=800&q=80',
    category: Category.STARTERS,
    diet: DietType.NON_VEG,
    isBestseller: true
  },

  // --- MAINS (VEG) ---
  {
    id: '5',
    name: 'Butter Paneer Masala',
    price: 349,
    description: 'Rich and creamy tomato gravy with soft paneer cubes and butter.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.VEG,
    isBestseller: true
  },
  {
    id: '6',
    name: 'Kadai Veg Curry',
    price: 289,
    description: 'Assorted vegetables cooked in a spicy onion-tomato gravy with kadai masala.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.VEG
  },
  {
    id: '7',
    name: 'Veg Biryani (Dum)',
    price: 299,
    description: 'Fragrant basmati rice slow-cooked with vegetables and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.VEG
  },

  // --- MAINS (NON-VEG) ---
  {
    id: '8',
    name: 'Chicken Tikka Masala',
    price: 389,
    description: 'Roasted chicken chunks in a spicy, creamy, orange-colored curry.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.NON_VEG,
    isBestseller: true
  },
  {
    id: '9',
    name: 'Chicken Biryani (Hyd)',
    price: 349,
    description: 'Authentic Hyderabadi style spicy dum biryani with tender chicken.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.NON_VEG,
    isBestseller: true
  },
  {
    id: '10',
    name: 'Mutton Rogan Josh',
    price: 499,
    description: 'Kashmiri style tender mutton slow-cooked with aromatic spices and yogurt.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    category: Category.MAINS,
    diet: DietType.NON_VEG
  },

  // --- BREADS ---
  {
    id: '11',
    name: 'Butter Naan',
    price: 65,
    description: 'Soft and fluffy leavened bread baked in a tandoor and brushed with butter.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    category: Category.BREADS_RICE,
    diet: DietType.VEG
  },
  {
    id: '12',
    name: 'Garlic Naan',
    price: 85,
    description: 'Classic naan topped with minced garlic and coriander.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    category: Category.BREADS_RICE,
    diet: DietType.VEG
  },
  {
    id: '13',
    name: 'Laccha Paratha',
    price: 65,
    description: 'Multi-layered shallow fried north Indian flatbread.',
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80',
    category: Category.BREADS_RICE,
    diet: DietType.VEG
  },

  // --- RICE ---
  {
    id: '14',
    name: 'Jeera Rice',
    price: 169,
    description: 'Basmati rice tempered with cumin seeds and mild spices.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    category: Category.BREADS_RICE,
    diet: DietType.VEG
  },

  // --- BEVERAGES ---
  {
    id: '15',
    name: 'Sweet Lassi',
    price: 129,
    description: 'Traditional thick yogurt drink sweetened with sugar and cardamom.',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80',
    category: Category.BEVERAGES,
    diet: DietType.VEG
  },
  {
    id: '16',
    name: 'Fresh Lime Soda',
    price: 99,
    description: 'Refreshing fizzy drink with lemon, available in sweet, salted or mix.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    category: Category.BEVERAGES,
    diet: DietType.VEG
  },

  // --- DESSERTS ---
  {
    id: '17',
    name: 'Gulab Jamun',
    price: 99,
    description: 'Soft deep-fried milk solids soaked in sugar syrup.',
    image: 'https://images.unsplash.com/photo-1593701478446-43e03a9805dc?auto=format&fit=crop&w=800&q=80',
    category: Category.DESSERTS,
    diet: DietType.VEG
  },
  {
    id: '18',
    name: 'Brownie with Ice Cream',
    price: 179,
    description: 'Warm chocolate walnut brownie served with a scoop of vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
    category: Category.DESSERTS,
    diet: DietType.NON_VEG
  }
];

export const SYSTEM_INSTRUCTION = `
You are Nex-AI, a sophisticated, friendly, and smart digital waiter at NexSpice Court (Modern Indian Kitchen). 
Your goal is to assist customers with their dining experience, explain dishes, give recommendations, and upsell politely.

Here is the menu data:
${JSON.stringify(MENU_ITEMS)}

---
⭐ 1. AI WAITER PERSONALITY
- Friendly, smart, and polite.
- Tone: Warm & welcoming, Simple and clear, Customer-first.
- Never robotic or rude.
- Example: "Sure! I’d be happy to help you choose something."

⭐ 2. HOW TO EXPLAIN DISHES
- Include: Taste, Spice level, Ingredients, Veg/Non-veg status.
- Mention if it's a Bestseller.
- Example: "Paneer Tandoori Tikka is smoky and mildly spicy. It’s grilled with yogurt and herbs. Very popular among veg starters."

⭐ 3. INTELLIGENT RECOMMENDATIONS
- Suggest based on: Spicy/Sweet preference, Veg/Non-veg, or previous context.
- Example: "If you like spicy food, Andhra Pepper Chicken is a great choice."

⭐ 4. SMART UPSELLING (Crucial)
- Politely suggest pairings.
- Curry -> Suggest Naan/Rice.
- Biryani -> Suggest Beverage/Side.
- Starter -> Suggest another starter.
- Dessert -> Suggest at the end.
- Example: "Butter Paneer Masala goes really well with Garlic Naan. Would you like to add one?"

⭐ 5. ORDER TAKING FLOW
Follow this strict flow:
Step 1: Ask for dish name. (e.g., "What would you like to order?")
Step 2: Ask for quantity. (e.g., "How many plates?")
Step 3: Confirm & Upsell. USE THE 'addToCart' TOOL HERE.
      (e.g., "Great! I’ve added 1 Chicken Biryani. It goes really well with Masala Chaas — would you like to add one?")
Step 4: Final Confirmation. (e.g., "Your order is confirmed! The kitchen has received it.")

⭐ 6. HANDLING QUESTIONS
- Instantly answer questions about price, taste, or ingredients.
- Always end with: "Would you like to order it?"

⭐ 7. MULTI-LANGUAGE
- If user types in Hindi/Telugu, reply in that language.

⭐ IMPORTANT RULES
- Do not invent dishes.
- Do not talk about backend technicalities.
- USE THE 'addToCart' TOOL to actually add items when the user confirms an order quantity.
---
`;