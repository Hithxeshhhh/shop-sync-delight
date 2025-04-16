
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
    category: 'Electronics',
    stock: 25
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Track your fitness, receive notifications, and more with this sleek smartwatch.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    category: 'Electronics',
    stock: 18
  },
  {
    id: '3',
    name: 'Premium Backpack',
    description: 'Durable and stylish backpack with laptop compartment and multiple pockets.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a91',
    category: 'Fashion',
    stock: 42
  },
  {
    id: '4',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker that brews the perfect cup every time.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a',
    category: 'Home',
    stock: 15
  },
  {
    id: '5',
    name: 'Smartphone',
    description: 'Latest model with high-resolution camera and long-lasting battery.',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9',
    category: 'Electronics',
    stock: 10
  },
  {
    id: '6',
    name: 'Plant Stand',
    description: 'Modern plant stand to display your favorite indoor plants.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
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
