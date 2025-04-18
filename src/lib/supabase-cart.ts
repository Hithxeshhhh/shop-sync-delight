import { supabase } from "./supabase";

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  options?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

/**
 * Get user cart items
 */
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id (
          name,
          image_url,
          price,
          inventory_count
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Transform the data to include product info
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      product_name: item.products.name,
      product_image: item.products.image_url,
      quantity: item.quantity,
      price: item.products.price,
      options: item.options,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error getting user cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number = 1,
  options?: Record<string, any>
): Promise<CartItem> => {
  try {
    // Check if the item already exists in the cart
    const { data: existingItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingItems) {
      // Item exists, update quantity
      const newQuantity = existingItems.quantity + quantity;
      
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          options: options || existingItems.options,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItems.id)
        .select()
        .single();

      if (error) throw error;
      
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, image_url, price')
        .eq('id', productId)
        .single();
        
      if (productError) throw productError;
      
      return {
        ...data,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price
      } as CartItem;
    } else {
      // Item doesn't exist, add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          options,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, image_url, price')
        .eq('id', productId)
        .single();
        
      if (productError) throw productError;
      
      return {
        ...data,
        product_name: product.name,
        product_image: product.image_url,
        price: product.price
      } as CartItem;
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<CartItem> => {
  try {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select(`
        *,
        products:product_id (
          name,
          image_url,
          price
        )
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      product_id: data.product_id,
      product_name: data.products.name,
      product_image: data.products.image_url,
      quantity: data.quantity,
      price: data.products.price,
      options: data.options,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as CartItem;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

/**
 * Update cart item options
 */
export const updateCartItemOptions = async (
  cartItemId: string,
  options: Record<string, any>
): Promise<CartItem> => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        options,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select(`
        *,
        products:product_id (
          name,
          image_url,
          price
        )
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      product_id: data.product_id,
      product_name: data.products.name,
      product_image: data.products.image_url,
      quantity: data.quantity,
      price: data.products.price,
      options: data.options,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as CartItem;
  } catch (error) {
    console.error('Error updating cart item options:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

/**
 * Clear user cart
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart total
 */
export const getCartTotal = async (userId: string): Promise<{
  subtotal: number;
  itemCount: number;
}> => {
  try {
    const cartItems = await getUserCart(userId);
    
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    const itemCount = cartItems.reduce(
      (count, item) => count + item.quantity, 
      0
    );
    
    return { subtotal, itemCount };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    throw error;
  }
}; 