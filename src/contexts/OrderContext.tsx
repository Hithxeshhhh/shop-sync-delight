import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Order } from "../types";

type OrderContextType = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  getOrder: (id: string) => Order | undefined;
  getCustomerOrders: (customerId: string) => Order[];
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

type OrderProviderProps = {
  children: ReactNode;
};

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize orders on mount
  useEffect(() => {
    const storedOrders = localStorage.getItem('ecommerce-orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
    setLoading(false);
  }, []);

  // Save orders to localStorage when they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('ecommerce-orders', JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id 
          ? { ...order, status } 
          : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prevOrders => 
      prevOrders.filter(order => order.id !== id)
    );
  };

  const getOrder = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(order => order.customerId === customerId);
  };

  const value = {
    orders,
    loading,
    error,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getOrder,
    getCustomerOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
