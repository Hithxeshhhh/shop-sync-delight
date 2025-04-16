
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  return (
    <div className="flex flex-col overflow-hidden transition-all hover:opacity-90">
      <Link to={`/products/${product.id}`} className="aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-cover"
        />
      </Link>
      
      <div className="pt-2 pb-4">
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="mr-1">{product.category}</span>
          {product.stock <= 0 && (
            <span className="ml-auto font-medium text-red-500">Out of Stock</span>
          )}
        </div>
        <Link to={`/products/${product.id}`} className="text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <p className="font-medium text-black mt-1">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
