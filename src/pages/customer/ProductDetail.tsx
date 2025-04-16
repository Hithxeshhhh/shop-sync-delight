
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../components/ui/carousel';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct } = useProducts();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const product = getProduct(id || '');
  
  // Set the document title based on product name
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Our Store`;
    } else {
      document.title = 'Product Not Found';
    }
    
    return () => {
      document.title = 'Our Store';
    };
  }, [product]);
  
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
  
  // If product has no images array or it's empty, use the single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];
  
  return (
    <div className="container py-8 max-w-7xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/products')} 
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-none">
            <CardContent className="p-0">
              <Carousel className="w-full">
                <CarouselContent>
                  {productImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <AspectRatio ratio={1/1} className="bg-muted">
                        <img 
                          src={image} 
                          alt={`${product.name} - Image ${index + 1}`} 
                          className="object-cover w-full h-full rounded-md"
                        />
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 lg:left-4" />
                <CarouselNext className="right-2 lg:right-4" />
              </Carousel>
            </CardContent>
          </Card>
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {productImages.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer border-2 rounded overflow-hidden flex-shrink-0 w-20 h-20 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <Badge variant="outline" className="text-xs font-normal">
                {product.category}
              </Badge>
              {product.stock > 0 ? (
                <Badge variant="secondary" className="ml-2 bg-green-50 text-green-600 hover:bg-green-50 text-xs font-normal">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-2 bg-red-50 text-red-600 hover:bg-red-50 text-xs font-normal">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-2xl font-medium text-primary mb-4">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
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
              <p className="text-sm text-gray-500">
                {product.stock > 0 
                  ? `${product.stock} items available` 
                  : 'Out of stock'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAddToCart} 
                className="sm:flex-1 gap-2" 
                size="lg"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              
              <Button variant="outline" size="icon" className="size-12">
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="icon" className="size-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Features and Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Free Shipping</h3>
                <p className="text-sm text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Warranty</h3>
                <p className="text-sm text-gray-500">1 year warranty</p>
              </div>
            </div>
            <div className="flex items-start">
              <RotateCcw className="h-5 w-5 text-primary mr-3" />
              <div>
                <h3 className="font-medium">30-Day Returns</h3>
                <p className="text-sm text-gray-500">Hassle-free returns</p>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="mt-8 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Additional Details</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><strong>SKU:</strong> {product.id}</li>
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Availability:</strong> {product.stock > 0 ? "In Stock" : "Out of Stock"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
