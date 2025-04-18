export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Added support for multiple images
  category: string;
  stock: number;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type OrderItem = {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal?: number;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_address?: Address;
  billing_address?: Address;
  shipping_method?: string;
  shipping_cost: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
};
