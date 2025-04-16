
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct } = useProducts();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  
  const product = getProduct(id || '');
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };
  
  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-8">Sorry, we couldn't find the product you're looking for.</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/products')} 
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-2xl font-medium text-primary mb-4">
            ${product.price.toFixed(2)}
          </div>
          
          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Label htmlFor="quantity" className="mr-4">Quantity:</Label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 mx-2 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
            
            <p className="text-sm">
              {product.stock > 0 
                ? `${product.stock} items in stock` 
                : 'Out of stock'}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleAddToCart} 
              className="w-full gap-2" 
              size="lg"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Category</h3>
              <p>{product.category}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Details</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>High-quality materials</li>
                <li>30-day return policy</li>
                <li>Free shipping on orders over $50</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
