
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/products/${product.id}`} className="text-lg font-semibold hover:text-primary transition-colors">
          {product.name}
        </Link>
        <p className="mt-2 font-medium text-primary">${product.price.toFixed(2)}</p>
        <p className="mt-1 text-sm text-muted-foreground truncate">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart} 
          className="w-full gap-2"
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
