
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductGrid from '../../components/products/ProductGrid';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Extract categories from products
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Handle URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    
    if (categoryParam) setCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);
  
  // Update URL params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (category) newSearchParams.set('category', category);
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (sortBy !== 'newest') newSearchParams.set('sort', sortBy);
    
    setSearchParams(newSearchParams);
  }, [category, searchTerm, sortBy, setSearchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };
  
  const clearFilters = () => {
    setCategory(undefined);
    setSearchTerm('');
    setSortBy('newest');
    setSearchParams({});
  };
  
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };
  
  // Sort products based on sortBy
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return 0; // maintain original order
    }
  });
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Products</h1>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {/* Sort and Filter */}
        <div className="flex gap-2 w-full md:w-1/2 justify-end">
          <div className="w-full md:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={toggleFilterMenu} 
            className="flex items-center gap-2 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters (larger screens) */}
        <div className="hidden md:block w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-1">
              <Button 
                variant={!category ? "secondary" : "outline"} 
                onClick={() => setCategory(undefined)} 
                className="w-full justify-start"
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button 
                  key={cat} 
                  variant={category === cat ? "secondary" : "outline"} 
                  onClick={() => setCategory(cat)} 
                  className="w-full justify-start"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          
          {(category || searchTerm || sortBy !== 'newest') && (
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Mobile Filters */}
        {isFilterMenuOpen && (
          <div className="md:hidden w-full p-4 border rounded-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFilterMenu}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <Label className="mb-2 block">Categories</Label>
              <div className="space-y-1">
                <Button 
                  variant={!category ? "secondary" : "outline"} 
                  onClick={() => setCategory(undefined)} 
                  className="w-full justify-start"
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button 
                    key={cat} 
                    variant={category === cat ? "secondary" : "outline"} 
                    onClick={() => setCategory(cat)} 
                    className="w-full justify-start"
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            
            {(category || searchTerm || sortBy !== 'newest') && (
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="w-full flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
        
        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading products...</p>
            </div>
          ) : (
            <ProductGrid 
              products={sortedProducts} 
              category={category} 
              searchTerm={searchTerm} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
