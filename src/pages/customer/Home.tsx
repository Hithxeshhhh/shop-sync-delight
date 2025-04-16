
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductCard from '../../components/products/ProductCard';
import { Button } from '../../components/ui/button';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';

const Home = () => {
  const { products } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Get a few random products to feature
    if (products.length > 0) {
      // Randomly select up to 4 products to feature
      const randomProducts = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      setFeaturedProducts(randomProducts);
    }
  }, [products]);

  const features = [
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "Curated Products",
      description: "Each item in our collection is carefully selected for quality and design."
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Fast Delivery",
      description: "Free shipping on all orders over $50. Quick delivery to your doorstep."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Payments",
      description: "Your transactions are protected with industry-standard encryption."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-100 to-blue-50 py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Products at ShopSync
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your one-stop destination for quality products, competitive prices, and exceptional service.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="gap-2">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="outline" size="lg">
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-8">Stay updated with the latest products, exclusive deals, and special offers.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 rounded-md text-foreground"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
