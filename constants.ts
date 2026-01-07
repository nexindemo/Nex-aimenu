
import { Category, DietType, Dish } from './types';

export const MENU_ITEMS: Dish[] = [
  {
    id: '1',
    name: 'Paneer Tandoori Tikka',
    price: 299,
    description: 'Cottage cheese cubes marinated in spiced yogurt and grilled to smoky perfection.',
    image: 'https://drive.google.com/uc?export=view&id=1NzXf3aqM6tYyQ0SyCmfvFhx0ifgwO1po',
    category: Category.STARTERS,
    diet: DietType.VEG,
    isBestseller: true
  },
  {
    id: '5',
    name: 'Butter Paneer Masala',
    price: 349,
    description: 'Rich and creamy tomato gravy with soft paneer cubes and butter.',
    image: 'https://drive.google.com/uc?export=view&id=1BVRFJ5ugzf8eOrdmdETDmeQEGi_1i5pD',
    category: Category.MAINS,
    diet: DietType.VEG,
    isBestseller: true
  },
  {
    id: '9',
    name: 'Chicken Biryani (Hyd)',
    price: 349,
    description: 'Authentic Hyderabadi style spicy dum biryani with tender chicken.',
    image: 'https://drive.google.com/uc?export=view&id=1ZetDFH_hDuj3Yy2PA8tzDpkNkK9Zst2f',
    category: Category.MAINS,
    diet: DietType.NON_VEG,
    isBestseller: true
  },
  {
    id: '12',
    name: 'Garlic Naan',
    price: 85,
    description: 'Classic naan topped with minced garlic and coriander.',
    image: 'https://drive.google.com/uc?export=view&id=1tkVVlacLgM2aupCXkYID3mQhvHFtNM1W',
    category: Category.BREADS_RICE,
    diet: DietType.VEG
  },
  {
    id: '17',
    name: 'Gulab Jamun',
    price: 99,
    description: 'Soft deep-fried milk solids soaked in sugar syrup.',
    image: 'https://drive.google.com/uc?export=view&id=1Kgo4FGToY5RDfQaeL0TyWOjqSpwMFv8D',
    category: Category.DESSERTS,
    diet: DietType.VEG
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

⭐ 2. HOW TO EXPLAIN DISHES
- Include: Taste, Spice level, Ingredients, Veg/Non-veg status.
- Mention if it's a Bestseller.

⭐ 3. INTELLIGENT RECOMMENDATIONS
- Suggest based on: Spicy/Sweet preference, Veg/Non-veg, or previous context.

⭐ 4. SMART UPSELLING
- Politely suggest pairings (e.g., Curry with Naan, Biryani with Beverage).

⭐ 5. ORDER TAKING FLOW
1. Ask for dish.
2. Ask for quantity.
3. Use 'addToCart' tool.
4. Confirm.

⭐ IMPORTANT RULES
- Do not invent dishes.
- USE THE 'addToCart' TOOL to actually add items.
---
`;
