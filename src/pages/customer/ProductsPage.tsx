
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductGrid from '../../components/products/ProductGrid';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Slider } from '../../components/ui/slider';
import { Card, CardContent } from '../../components/ui/card';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Price filter
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  
  // Extract categories from products
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Find the max price among products on mount
  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(product => product.price));
      const roundedMaxPrice = Math.ceil(highestPrice / 100) * 100; // Round up to nearest 100
      setMaxPrice(roundedMaxPrice);
      setPriceRange([0, roundedMaxPrice]);
    }
  }, [products]);
  
  // Handle URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    if (categoryParam) setCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (sortParam) setSortBy(sortParam);
    if (minPriceParam && maxPriceParam) {
      setPriceRange([Number(minPriceParam), Number(maxPriceParam)]);
    }
  }, [searchParams]);
  
  // Update URL params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (category) newSearchParams.set('category', category);
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (sortBy !== 'newest') newSearchParams.set('sort', sortBy);
    
    // Add price range to URL params
    if (priceRange[0] > 0) newSearchParams.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < maxPrice) newSearchParams.set('maxPrice', priceRange[1].toString());
    
    setSearchParams(newSearchParams);
  }, [category, searchTerm, sortBy, priceRange, setSearchParams, maxPrice]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };
  
  const clearFilters = () => {
    setCategory(undefined);
    setSearchTerm('');
    setSortBy('newest');
    setPriceRange([0, maxPrice]);
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
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Categories Filter */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
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
                
                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-4">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, maxPrice]}
                      value={[priceRange[0], priceRange[1]]}
                      max={maxPrice}
                      step={1}
                      onValueChange={handlePriceChange}
                      className="mb-6"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {(category || searchTerm || sortBy !== 'newest' || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
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
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile Filters */}
        {isFilterMenuOpen && (
          <div className="md:hidden w-full mb-4">
            <Card>
              <CardContent className="pt-6 pb-6">
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
                
                <div className="space-y-6">
                  {/* Categories Filter */}
                  <div>
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
                  
                  {/* Price Range Filter */}
                  <div>
                    <Label className="mb-2 block">Price Range</Label>
                    <div className="px-2">
                      <Slider
                        defaultValue={[0, maxPrice]}
                        value={[priceRange[0], priceRange[1]]}
                        max={maxPrice}
                        step={1}
                        onValueChange={handlePriceChange}
                        className="mb-6"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(category || searchTerm || sortBy !== 'newest' || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
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
              </CardContent>
            </Card>
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
              priceRange={priceRange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
