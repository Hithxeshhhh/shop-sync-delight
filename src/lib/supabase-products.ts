import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Creates a new product in the database
 */
export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned from product creation');
    
    return data as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Updates an existing product in the database
 */
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('No data returned from product update');
    
    return data as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Deletes a product from the database
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Gets a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Gets all products with optional filtering
 */
export const getProducts = async (options?: {
  category?: string;
  search?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
}): Promise<{ data: Product[]; count: number }> => {
  try {
    // Start query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (options?.activeOnly !== false) {
      // Default to active products only unless explicitly set to false
      query = query.eq('is_active', true);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    
    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    } else {
      // Default ordering
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { 
      data: data as Product[],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Updates product stock quantity
 */
export const updateProductStock = async (id: string, quantityChange: number): Promise<void> => {
  try {
    // First get current stock to make sure we don't go negative
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!product) throw new Error('Product not found');
    
    const newQuantity = product.stock_quantity + quantityChange;
    
    if (newQuantity < 0) {
      throw new Error('Insufficient stock quantity');
    }
    
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}; 