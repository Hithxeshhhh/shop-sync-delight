
import { useState, useEffect } from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: Product[];
  category?: string;
  searchTerm?: string;
};

const ProductGrid = ({ products, category, searchTerm }: ProductGridProps) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  
  useEffect(() => {
    let result = products;
    
    // Filter by category if specified
    if (category && category !== 'all') {
      result = result.filter(product => product.category === category);
    }
    
    // Filter by search term if specified
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(result);
  }, [products, category, searchTerm]);
  
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground mt-2">
          Try changing your filters or search criteria
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
