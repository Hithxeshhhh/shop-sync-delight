import { AlertCircle, ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../lib/supabase-orders";
import { Address } from "../../types";
import { toast } from "@/components/ui/use-toast";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const handleQuantityChange = (id: string, value: number) => {
    updateQuantity(id, value);
  };
  
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };
  
  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    setIsCheckoutOpen(true);
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePlaceOrder = async () => {
    if (!user) return;
    
    // Verify all fields are filled
    const addressValues = Object.values(address);
    if (addressValues.some(val => val.trim() === '')) {
      toast({
        title: "Missing Information",
        description: "Please fill in all address fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate values
      const subtotal = total;
      const shippingCost = 0; // Free shipping
      const tax = subtotal * 0.07; // Example tax rate of 7%
      const orderTotal = subtotal + tax + shippingCost;
      
      // Create order items from cart
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      }));
      
      // Create order using Supabase function
      await createOrder(
        user.id,
        'pending',
        'pending',
        address,
        address, // Using same address for billing and shipping
        'Standard',
        shippingCost,
        subtotal,
        tax,
        0, // No discount
        orderTotal,
        '', // No notes
        orderItems
      );
      
      // Clear cart
      clearCart();
      
      // Close dialog
      setIsCheckoutOpen(false);
      
      // Show success message
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
      });
      
      // Redirect to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Button onClick={() => navigate('/products')}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 grid grid-cols-12 font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {items.map((item) => (
              <div key={item.product.id} className="border-t p-4 grid grid-cols-12 items-center">
                <div className="col-span-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <button 
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 text-center">
                  ${item.product.price.toFixed(2)}
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-12 h-8 mx-1 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="col-span-2 text-right font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={() => clearCart()}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </div>
        
        <div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax (7%)</span>
                <span>${(total * 0.07).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 font-bold flex justify-between">
                <span>Total</span>
                <span>${(total + (total * 0.07)).toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleCheckout}
            >
              Checkout
            </Button>
            
            {!user && (
              <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                You'll need to login before checkout
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Shipping Information</DialogTitle>
            <DialogDescription>
              Enter your shipping address to complete your order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="street" className="text-right">
                Street Address
              </Label>
              <Input
                id="street"
                name="street"
                placeholder="123 Main St"
                className="col-span-3"
                value={address.street}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Cityville"
                className="col-span-3"
                value={address.city}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State/Province
              </Label>
              <Input
                id="state"
                name="state"
                placeholder="State"
                className="col-span-3"
                value={address.state}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zipCode" className="text-right">
                Zip/Postal Code
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="12345"
                className="col-span-3"
                value={address.zipCode}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                className="col-span-3"
                value={address.country}
                onChange={handleAddressChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
