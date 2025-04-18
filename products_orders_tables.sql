-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order items (products in an order)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('card', 'bank_account')),
  provider TEXT NOT NULL,
  last_four TEXT NOT NULL,
  expiry_date TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  payment_token TEXT,
  billing_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stored procedure for creating order with items
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_status TEXT,
  p_payment_status TEXT,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_shipping_method TEXT,
  p_shipping_cost DECIMAL,
  p_subtotal DECIMAL,
  p_tax DECIMAL,
  p_discount DECIMAL,
  p_total DECIMAL,
  p_notes TEXT,
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_created_at TIMESTAMP WITH TIME ZONE := now();
  v_item JSONB;
  v_result JSONB;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (
    user_id, status, payment_status, shipping_address, billing_address,
    shipping_method, shipping_cost, subtotal, tax, discount, total, notes,
    created_at, updated_at
  ) VALUES (
    p_user_id, p_status, p_payment_status, p_shipping_address, p_billing_address,
    p_shipping_method, p_shipping_cost, p_subtotal, p_tax, p_discount, p_total, p_notes,
    v_created_at, v_created_at
  ) RETURNING id INTO v_order_id;
  
  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image, quantity, price, options, created_at
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      v_item->>'product_image',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL,
      (v_item->>'options')::JSONB,
      v_created_at
    );
    
    -- Update product stock
    UPDATE public.products
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;
  
  -- Prepare result
  SELECT jsonb_build_object(
    'order_id', v_order_id,
    'status', 'success'
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Anyone can view active products
CREATE POLICY product_select ON public.products
  FOR SELECT USING (is_active = true OR (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

-- Only admins can insert/update/delete products
CREATE POLICY product_insert ON public.products
  FOR INSERT WITH CHECK ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

CREATE POLICY product_update ON public.products
  FOR UPDATE USING ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

CREATE POLICY product_delete ON public.products
  FOR DELETE USING ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

-- RLS Policies for orders
-- Users can see their own orders, admins can see all orders
CREATE POLICY order_select ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Users can create their own orders
CREATE POLICY order_insert ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (if not delivered/cancelled), admins can update any order
CREATE POLICY order_update ON public.orders
  FOR UPDATE USING (
    (auth.uid() = user_id AND status NOT IN ('delivered', 'cancelled')) OR 
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Only admins can delete orders
CREATE POLICY order_delete ON public.orders
  FOR DELETE USING ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

-- RLS Policies for order items
-- Users can see items in their orders, admins can see all
CREATE POLICY order_item_select ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND public.orders.user_id = auth.uid()
    ) OR 
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Users can add items to their own orders
CREATE POLICY order_item_insert ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id 
      AND public.orders.user_id = auth.uid()
      AND public.orders.status = 'pending'
    )
  );

-- RLS Policies for cart items
-- Users can only see their own cart
CREATE POLICY cart_select ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own cart
CREATE POLICY cart_insert ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cart_update ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY cart_delete ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for payments
-- Users can see their own payments, admins can see all
CREATE POLICY payment_select ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Users can create payments for their own orders
CREATE POLICY payment_insert ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.payments.order_id 
      AND public.orders.user_id = auth.uid()
    )
  );

-- Only admins can update payments
CREATE POLICY payment_update ON public.payments
  FOR UPDATE USING ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

-- Only admins can delete payments
CREATE POLICY payment_delete ON public.payments
  FOR DELETE USING ((SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true);

-- RLS Policies for payment methods
-- Users can only see their own payment methods
CREATE POLICY payment_method_select ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only add their own payment methods
CREATE POLICY payment_method_insert ON public.payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own payment methods
CREATE POLICY payment_method_update ON public.payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own payment methods
CREATE POLICY payment_method_delete ON public.payment_methods
  FOR DELETE USING (auth.uid() = user_id); 