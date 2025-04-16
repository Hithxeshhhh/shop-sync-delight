
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShoppingCart, ImageIcon } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md group h-full flex flex-col">
      <Link to={`/products/${product.id}`} className="relative block">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {product.images && product.images.length > 1 && (
            <Badge className="absolute bottom-2 right-2 bg-black/70" variant="secondary">
              <ImageIcon className="h-3 w-3 mr-1" />
              {product.images.length}
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <Badge variant="outline" className="rounded-sm text-xs font-normal">
            {product.category}
          </Badge>
        </div>
        
        <Link to={`/products/${product.id}`} className="text-base font-medium hover:underline mt-1">
          {product.name}
        </Link>
        
        <p className="font-medium text-primary mt-auto pt-2">${product.price.toFixed(2)}</p>
        
        <Button 
          onClick={handleAddToCart}
          variant="outline" 
          size="sm"
          className="w-full mt-3"
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
