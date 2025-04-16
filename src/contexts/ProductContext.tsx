
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product } from '../types';

type ProductContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Sample initial products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with long battery life.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944'
    ],
    category: 'Electronics',
    stock: 25
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Track your fitness, receive notifications, and more with this sleek smartwatch.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d'
    ],
    category: 'Electronics',
    stock: 18
  },
  {
    id: '3',
    name: 'Premium Backpack',
    description: 'Durable and stylish backpack with laptop compartment and multiple pockets.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a91',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a91',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601'
    ],
    category: 'Fashion',
    stock: 42
  },
  {
    id: '4',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker that brews the perfect cup every time.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a',
    images: [
      'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a',
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
      'https://images.unsplash.com/photo-1610889556528-9a770e32642f'
    ],
    category: 'Home',
    stock: 15
  },
  {
    id: '5',
    name: 'Smartphone',
    description: 'Latest model with high-resolution camera and long-lasting battery.',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
      'https://images.unsplash.com/photo-1571380401583-72ca84994796'
    ],
    category: 'Electronics',
    stock: 10
  },
  {
    id: '6',
    name: 'Plant Stand',
    description: 'Modern plant stand to display your favorite indoor plants.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
      'https://images.unsplash.com/photo-1463320726281-696a485928c7',
      'https://images.unsplash.com/photo-1526565782131-a7c8c4a4690b',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36'
    ],
    category: 'Home',
    stock: 30
  }
];

type ProductProviderProps = {
  children: ReactNode;
};

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize products on mount
  useEffect(() => {
    const storedProducts = localStorage.getItem('ecommerce-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Use initial products if no stored data
      setProducts(initialProducts);
      localStorage.setItem('ecommerce-products', JSON.stringify(initialProducts));
    }
    setLoading(false);
  }, []);

  // Save products to localStorage when they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('ecommerce-products', JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id 
          ? { ...product, ...updatedFields } 
          : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== id)
    );
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const value = {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
