export interface ImageVariant {
  id: string;
  image: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image?: string;
  images?: string | string[];
  badge?: string;
  sold?: number;
  stock?: number;
  image_inventory?: ImageVariant[];
  category?: string;
  is_trend?: boolean;
  sizes?: string;
  seller_id?: string;
  seller_name?: string;
  seller_business_name?: string;
  seller_profile_pic?: string;
  seller_phone?: string;
  seller_follower_count?: number;
  views?: number;
  upVotes?: number;
  downVotes?: number;
  review_count?: number;
  seller?: {
    id?: string;
    full_name?: string | null;
    business_name?: string | null;
    phone?: string | null;
  } | null;
}

export interface CartItem {
  cart_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  image?: string;
  size?: string;
  productImage?: string;
}

export interface User {
  id: string | number;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role?: string;
  account_status?: string;
  seller_approval_status?: string;
  business_name?: string;
  profile_pic?: string;
  notifications_enabled?: boolean;
  email_confirmed_at?: string | null;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: string;
  type: 'welcome' | 'order_placed' | 'order_confirmed' | 'order_cancelled' | 'payment_received' | 'order_delivered' | 'new_follower' | 'product_review';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
}
