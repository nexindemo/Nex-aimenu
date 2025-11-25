export enum Category {
  ALL = 'All',
  STARTERS = 'Starters',
  MAINS = 'Mains',
  BREADS_RICE = 'Breads & Rice',
  BEVERAGES = 'Beverages',
  DESSERTS = 'Desserts'
}

export enum DietType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG'
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: Category;
  diet: DietType;
  isBestseller?: boolean;
}

export interface CartItem extends Dish {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}