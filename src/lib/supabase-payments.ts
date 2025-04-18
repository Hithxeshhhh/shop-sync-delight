import { supabase } from "./supabase";
import { PaymentStatus } from "./supabase-orders";

export type PaymentMethod = {
  id: string;
  user_id: string;
  payment_type: 'card' | 'bank_account';
  provider: string;
  last_four: string;
  expiry_date?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  payment_token?: string;
  billing_details?: {
    name?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    }
  };
};

export type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method_id: string | null;
  payment_intent_id: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

/**
 * Create a new payment
 */
export const createPayment = async (
  orderId: string,
  userId: string,
  amount: number,
  currency: string = 'USD',
  paymentMethodId?: string,
  paymentIntentId?: string,
  status: PaymentStatus = 'pending'
): Promise<Payment> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: userId,
        amount,
        currency,
        payment_method_id: paymentMethodId || null,
        payment_intent_id: paymentIntentId || null,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  paymentIntentId?: string
): Promise<Payment> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (paymentIntentId) {
      updateData.payment_intent_id = paymentIntentId;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw error;
    }
    
    return data as Payment;
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    throw error;
  }
};

/**
 * Get payments by order ID
 */
export const getPaymentsByOrderId = async (orderId: string): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return (data || []) as Payment[];
  } catch (error) {
    console.error('Error getting payments by order ID:', error);
    throw error;
  }
};

/**
 * Get user's payment methods
 */
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return (data || []) as PaymentMethod[];
  } catch (error) {
    console.error('Error getting user payment methods:', error);
    throw error;
  }
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (
  userId: string, 
  paymentType: 'card' | 'bank_account',
  provider: string,
  lastFour: string,
  expiryDate?: string,
  isDefault: boolean = false,
  paymentToken?: string,
  billingDetails?: PaymentMethod['billing_details']
): Promise<PaymentMethod> => {
  try {
    // If this is being set as default, unset any existing default
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: userId,
        payment_type: paymentType,
        provider,
        last_four: lastFour,
        expiry_date: expiryDate,
        is_default: isDefault,
        payment_token: paymentToken,
        billing_details: billingDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

/**
 * Set a payment method as default
 */
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<PaymentMethod> => {
  try {
    // Unset any existing default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);

    // Set new default
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ 
        is_default: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentMethodId)
      .eq('user_id', userId) // Security check
      .select()
      .single();

    if (error) throw error;
    return data as PaymentMethod;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    // Check if this is the default payment method
    const { data: method } = await supabase
      .from('payment_methods')
      .select('is_default')
      .eq('id', paymentMethodId)
      .eq('user_id', userId) // Security check
      .single();

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId); // Security check

    if (error) throw error;

    // If the deleted method was the default, set another one as default if available
    if (method && method.is_default) {
      const { data: methods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (methods && methods.length > 0) {
        await setDefaultPaymentMethod(userId, methods[0].id);
      }
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}; 