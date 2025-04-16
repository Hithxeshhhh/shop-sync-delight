
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductGrid from '../../components/products/ProductGrid';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Slider } from '../../components/ui/slider';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter states
  const [showAvailability, setShowAvailability] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Size filter
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', '2X'];
  
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
    const inStockParam = searchParams.get('inStock');
    const sizeParam = searchParams.get('sizes');
    
    if (categoryParam) setCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
    if (sortParam) setSortBy(sortParam);
    if (inStockParam === 'true') setInStockOnly(true);
    if (sizeParam) setSelectedSizes(sizeParam.split(','));
    
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
    if (inStockOnly) newSearchParams.set('inStock', 'true');
    if (selectedSizes.length > 0) newSearchParams.set('sizes', selectedSizes.join(','));
    
    // Add price range to URL params
    if (priceRange[0] > 0) newSearchParams.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < maxPrice) newSearchParams.set('maxPrice', priceRange[1].toString());
    
    setSearchParams(newSearchParams);
  }, [category, searchTerm, sortBy, priceRange, inStockOnly, selectedSizes, setSearchParams, maxPrice]);
  
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
    setInStockOnly(false);
    setSelectedSizes([]);
    setSearchParams({});
  };
  
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
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
  
  // Filter products by in-stock status if needed
  const availabilityFilteredProducts = inStockOnly 
    ? sortedProducts.filter(product => product.stock > 0)
    : sortedProducts;
  
  // Filter products by selected sizes (this is a placeholder since the Product type may not have sizes)
  // In a real app, you'd filter by product.sizes or similar
  const filteredProducts = availabilityFilteredProducts;
  
  // Get count of available products
  const availableProductsCount = products.filter(p => p.stock > 0).length;
  const outOfStockCount = products.length - availableProductsCount;
  
  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span>Home</span> / <span className="font-medium text-black">Products</span>
      </div>
      
      <h1 className="text-2xl font-bold uppercase mb-6">PRODUCTS</h1>
      
      {/* Search bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-100 border-gray-300"
          />
        </form>
      </div>
      
      {/* Categories horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto py-2 mb-6 no-scrollbar">
        <Button 
          variant={category === undefined ? "default" : "outline"} 
          onClick={() => setCategory(undefined)}
          size="sm"
          className="whitespace-nowrap rounded-full"
        >
          New
        </Button>
        <Button 
          variant={category === "best-seller" ? "default" : "outline"} 
          onClick={() => setCategory("best-seller")}
          size="sm"
          className="whitespace-nowrap rounded-full"
        >
          Best Sellers
        </Button>
        {categories.map((cat) => (
          <Button 
            key={cat} 
            variant={category === cat ? "default" : "outline"} 
            onClick={() => setCategory(cat)} 
            size="sm"
            className="whitespace-nowrap rounded-full"
          >
            {cat.toUpperCase()}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="md:w-64 space-y-6">
          <h2 className="font-bold mb-4">Filters</h2>
          
          {/* Size filter */}
          <div className="space-y-2">
            <h3 className="font-medium mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button 
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`min-w-[40px] h-10 px-3 border border-gray-300 text-sm flex items-center justify-center ${
                    selectedSizes.includes(size) ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Availability filter */}
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAvailability(!showAvailability)}
            >
              <h3 className="font-medium">Availability</h3>
              {showAvailability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showAvailability && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="availability-in-stock" 
                    checked={!inStockOnly} 
                    onCheckedChange={() => setInStockOnly(false)}
                  />
                  <Label htmlFor="availability-in-stock" className="text-sm flex items-center justify-between w-full">
                    <span>Availability</span>
                    <span className="text-gray-500">({availableProductsCount})</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="out-of-stock" 
                    checked={inStockOnly} 
                    onCheckedChange={() => setInStockOnly(true)}
                  />
                  <Label htmlFor="out-of-stock" className="text-sm flex items-center justify-between w-full">
                    <span>Out Of Stock</span>
                    <span className="text-gray-500">({outOfStockCount})</span>
                  </Label>
                </div>
              </div>
            )}
          </div>
          
          {/* Category filter */}
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowCategory(!showCategory)}
            >
              <h3 className="font-medium">Category</h3>
              {showCategory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showCategory && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="category-all" 
                    checked={category === undefined} 
                    onCheckedChange={() => setCategory(undefined)}
                  />
                  <Label htmlFor="category-all" className="text-sm">All Categories</Label>
                </div>
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${cat}`} 
                      checked={category === cat} 
                      onCheckedChange={() => setCategory(category === cat ? undefined : cat)}
                    />
                    <Label htmlFor={`category-${cat}`} className="text-sm">{cat}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Price Range filter */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowPrice(!showPrice)}
            >
              <h3 className="font-medium">Price Range</h3>
              {showPrice ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showPrice && (
              <div className="px-2">
                <Slider
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
            )}
          </div>
          
          {/* Clear Filters Button */}
          {(category || searchTerm || sortBy !== 'newest' || priceRange[0] > 0 || priceRange[1] < maxPrice || inStockOnly || selectedSizes.length > 0) && (
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full flex items-center gap-2"
            >
              <X size={16} />
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort dropdown (mobile) */}
          <div className="flex justify-end mb-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
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
          
          {loading ? (
            <div className="text-center py-12">
              <p>Loading products...</p>
            </div>
          ) : (
            <ProductGrid 
              products={filteredProducts} 
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
