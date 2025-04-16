
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Trash2, ArrowLeft, ShoppingBag, AlertCircle, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from '@/components/ui/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState({
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
  
  const handlePlaceOrder = () => {
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
    
    // Create order object
    const order = {
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: total,
      status: 'pending' as const,
      shippingAddress: address
    };
    
    // Add order
    addOrder(order);
    
    // Clear cart
    clearCart();
    
    // Close dialog
    setIsCheckoutOpen(false);
    
    // Show success message
    toast({
      title: "Order Placed",
      description: "Your order has been successfully placed!",
    });
    
    // Redirect to home
    navigate('/');
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
              <div className="border-t pt-3 font-bold flex justify-between">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Please enter your shipping information to place your order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input 
                id="street" 
                name="street" 
                value={address.street} 
                onChange={handleAddressChange}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={address.city} 
                  onChange={handleAddressChange}
                  placeholder="New York"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  name="state" 
                  value={address.state} 
                  onChange={handleAddressChange}
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input 
                  id="zipCode" 
                  name="zipCode" 
                  value={address.zipCode} 
                  onChange={handleAddressChange}
                  placeholder="10001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  name="country" 
                  value={address.country} 
                  onChange={handleAddressChange}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
