// Category and Product Models for Marketplace

export interface Category {
  id: string;
  name: string;
  nameKey?: string;
  icon: string;
  image?: string;
  productCount: number;
  subcategories?: Category[];
  description?: string;
}

export interface SubcategoryItem {
  name: string;
  id: string;
}

export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  sku?: string;
  stock?: number;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
}

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  longDescription?: string;
  price: number;
  currency?: string;
  oldPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  reviewsList?: Review[];
  image?: string;
  images?: string[];
  badge?: string;
  seller?: string;
  sellerRating?: number;
  categoryId: string;
  subcategoryId?: string;
  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  specifications?: { name: string; value: string }[];
  delivery?: {
    days: number;
    price: number;
    free: boolean;
  };
  brand?: string;
  inStock: boolean;
  favorite?: boolean;
  tags?: string[];
  __lookupSource?: string; // debug: indicates where product was loaded from (cache/reload/mock)
}

export interface FilterOptions {
  priceFrom?: number;
  priceTo?: number;
  brands?: string[];
  rating?: number;
  inStock?: boolean;
  sortBy?: 'popularity' | 'rating' | 'priceLow' | 'priceHigh' | 'new';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedColor?: string;
  selectedSize?: string;
}
