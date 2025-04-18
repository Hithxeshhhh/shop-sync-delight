import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { updateProductStock } from "./supabase-products";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  shipping_method?: string;
  shipping_cost: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  options?: Record<string, any>;
  created_at: string;
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: {
      name: string;
      image_url: string | null;
    };
  })[];
};

/**
 * Create a new order
 */
export const createOrder = async (
  userId: string,
  status: OrderStatus = 'pending',
  paymentStatus: PaymentStatus = 'pending',
  shippingAddress: Order['shipping_address'],
  billingAddress: Order['billing_address'] | undefined = undefined,
  shippingMethod: string | undefined = undefined,
  shippingCost: number = 0,
  subtotal: number,
  tax: number = 0,
  discount: number = 0,
  total: number,
  notes: string | undefined = undefined,
  items: Array<{
    product_id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    options?: Record<string, any>;
  }>
): Promise<{ order: Order, orderItems: OrderItem[] }> => {
  try {
    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status,
        payment_status: paymentStatus,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        subtotal,
        tax,
        discount,
        total,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      price: item.price,
      options: item.options,
      created_at: new Date().toISOString(),
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    return { 
      order: order as Order, 
      orderItems: insertedItems as OrderItem[] 
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<Order> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get order by ID with items
 */
export const getOrderById = async (
  orderId: string
): Promise<{ order: Order, items: OrderItem[] } | null> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') return null; // Record not found
      throw orderError;
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return {
      order: order as Order,
      items: (items || []) as OrderItem[]
    };
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (
  userId: string,
  status?: OrderStatus
): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Order[];
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

/**
 * Get order items
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return (data || []) as OrderItem[];
  } catch (error) {
    console.error('Error getting order items:', error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Get all orders (admin function)
 */
export const getAllOrders = async (
  status?: OrderStatus,
  limit: number = 100,
  offset: number = 0
): Promise<{ orders: Order[], count: number }> => {
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { 
      orders: (data || []) as Order[], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

/**
 * Search orders (admin function)
 */
export const searchOrders = async (
  searchTerm: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ orders: Order[], count: number }> => {
  try {
    // Convert search term to lowercase for case-insensitive search
    const term = searchTerm.toLowerCase();
    
    // Get user IDs that match the search term
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .or(`email.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
    
    const userIds = users ? users.map(user => user.id) : [];

    // Search for orders by ID or user IDs from the search
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .or(
        userIds.length > 0 
          ? `id.ilike.%${term}%,user_id.in.(${userIds.join(',')})` 
          : `id.ilike.%${term}%`
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { 
      orders: (data || []) as Order[], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
}; 