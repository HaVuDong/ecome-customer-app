export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  category: string;
  description: string;
  stock: number;
  images?: string[];
  variations?: Variation[];
  shop?: Shop;
  specifications?: Record<string, string>;
  reviews?: Review[];
  seller?: {
    id: number;
    username?: string;
    fullName?: string;
    avatar?: string;
  };
}

export interface Variation {
  type: 'color' | 'size';
  name: string;
  options: string[];
}

export interface Shop {
  name: string;
  rating: number;
  products: number;
  responseRate: number;
  responseTime: string;
  followers: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface BannerItem {
  id: string;
  image: string;
  link?: string;
}

export interface User {
  name: string;
  avatar: string;
  email: string;
  phone: string;
}

export interface Voucher {
  id: string;
  code: string;
  discount: string;
  minSpend: number;
  description: string;
  validUntil: string;
  claimed: boolean;
}

export interface FlashSaleProduct {
  product: Product;
  flashPrice: number;
  stockLimit: number;
  sold: number;
  endTime: Date;
}

export interface LiveStream {
  id: string;
  title: string;
  thumbnail: string;
  viewers: number;
  shopName: string;
  isLive: boolean;
}