import { Loader2, Package, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { cancelOrder, getUserOrders, searchOrders } from "../../lib/supabase-orders";
import { Order, OrderItem } from "../../types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders);
        
        // Create a map of order items keyed by order ID
        const itemsMap: Record<string, OrderItem[]> = {};
        for (const order of userOrders) {
          if (order.items) {
            itemsMap[order.id] = order.items;
          }
        }
        setOrderItems(itemsMap);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  useEffect(() => {
    const handleSearch = async () => {
      if (!user || !searchTerm.trim()) {
        // If search is cleared, fetch all user orders
        if (searchTerm === '' && user) {
          try {
            setLoading(true);
            const userOrders = await getUserOrders(user.id);
            setOrders(userOrders);
          } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again later.');
          } finally {
            setLoading(false);
          }
        }
        return;
      }
      
      try {
        setLoading(true);
        // Use the searchOrders function with the search term
        const searchResults = await searchOrders(searchTerm, 50, 0);
        // Filter to only show the current user's orders
        const filteredResults = searchResults.orders.filter(order => order.user_id === user.id);
        setOrders(filteredResults);
      } catch (err) {
        console.error('Error searching orders:', err);
        setError('Failed to search orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Use debounce to avoid too many API calls while typing
    const debounceTimeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, user]);
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      // Update the local state to reflect the cancellation
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' } 
            : order
        )
      );
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again later.');
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4 mr-1" />;
      case 'processing':
        return <Package className="h-4 w-4 mr-1" />;
      case 'shipped':
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case 'delivered':
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <Package className="h-4 w-4 mr-1" />;
      default:
        return <Package className="h-4 w-4 mr-1" />;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {!user ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-medium mb-2">Please log in to view your orders</h3>
            <p className="text-muted-foreground mb-4">You need to be logged in to see your order history</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>{formatDate(order.created_at || '')}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusBadgeVariant(order.status)}
                          className="w-fit flex items-center"
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                        {order.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="items">
                        <AccordionTrigger className="px-6 py-4">
                          Order Details
                        </AccordionTrigger>
                        <AccordionContent className="px-0">
                          <div className="border-t">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Price</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items && order.items.map((item, idx) => (
                                  <TableRow key={`${order.id}-${idx}`}>
                                    <TableCell className="font-medium">{item.product_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${item.price.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="p-6 border-t">
                            <div className="mb-4 space-y-2">
                              <h4 className="font-semibold">Shipping Address</h4>
                              <p>{order.shipping_address?.street}</p>
                              <p>
                                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}
                              </p>
                              <p>{order.shipping_address?.country}</p>
                            </div>
                            <div className="flex justify-between pt-4 font-semibold border-t">
                              <span>Total</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-xl font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <Button asChild>
                  <Link to="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
