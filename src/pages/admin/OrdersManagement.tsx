import AdminLayout from "../../components/layout/AdminLayout";
import { CheckCircle, Clock, Eye, Loader2, Package, Search, Trash2, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { cancelOrder, getAllOrders, getOrderById, searchOrders, updateOrderStatus } from "../../lib/supabase-orders";
import { Order, OrderStatus } from "../../types";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Fetch all orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders();
        setOrders(response.orders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        if (searchTerm === '') {
          try {
            setLoading(true);
            const response = await getAllOrders();
            setOrders(response.orders);
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
        const searchResults = await searchOrders(searchTerm, 50, 0);
        setOrders(searchResults.orders);
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
  }, [searchTerm]);
  
  // Handle status change
  const handleStatusChange = async (status: OrderStatus) => {
    if (currentOrder) {
      try {
        await updateOrderStatus(currentOrder.id, status);
        
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === currentOrder.id 
              ? { ...order, status } 
              : order
          )
        );
        
        // Update current order
        setCurrentOrder({
          ...currentOrder,
          status
        });
        
        toast({
          title: "Order status updated",
          description: `Order #${currentOrder.id} has been marked as ${status}.`,
        });
      } catch (err) {
        console.error('Error updating order status:', err);
        toast({
          title: "Error",
          description: "Failed to update order status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle delete order
  const handleDeleteOrder = async () => {
    if (currentOrder) {
      try {
        await cancelOrder(currentOrder.id);
        
        // Update the orders list
        setOrders(prevOrders => 
          prevOrders.filter(order => order.id !== currentOrder.id)
        );
        
        setIsDeleteDialogOpen(false);
        setCurrentOrder(null);
        
        toast({
          title: "Order cancelled",
          description: `Order #${currentOrder.id} has been cancelled.`,
        });
      } catch (err) {
        console.error('Error cancelling order:', err);
        toast({
          title: "Error",
          description: "Failed to cancel order. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Open view dialog
  const openViewDialog = async (order: Order) => {
    try {
      // We need to fetch the full order with items
      const fullOrder = await getOrderById(order.id);
      if (fullOrder) {
        setCurrentOrder(fullOrder);
        setIsViewDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Could not find order details.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Open delete dialog
  const openDeleteDialog = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteDialogOpen(true);
  };
  
  // Get status badge color
  const getStatusBadgeVariant = (status: OrderStatus) => {
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
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'processing':
        return <Package className="h-4 w-4 mr-1" />;
      case 'shipped':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      
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
        <div className="p-8 text-center">
          <h3 className="text-xl font-medium mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.user_id}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="flex w-fit items-center">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openViewDialog(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDialog(order)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {currentOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="py-4">
              <div className="mb-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
                  <p className="font-medium">User ID: {currentOrder.user_id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
                  <p>{currentOrder.shipping_address?.street}</p>
                  <p>
                    {currentOrder.shipping_address?.city}, {currentOrder.shipping_address?.state} {currentOrder.shipping_address?.zipCode}
                  </p>
                  <p>{currentOrder.shipping_address?.country}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Status</h3>
                  <div className="mt-2">
                    <Select
                      defaultValue={currentOrder.status}
                      onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="pending" className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" /> Pending
                        </SelectItem>
                        <SelectItem value="processing" className="flex items-center">
                          <Package className="h-4 w-4 mr-2" /> Processing
                        </SelectItem>
                        <SelectItem value="shipped" className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" /> Shipped
                        </SelectItem>
                        <SelectItem value="delivered" className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" /> Delivered
                        </SelectItem>
                        <SelectItem value="cancelled" className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2" /> Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {currentOrder.items && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Subtotal</span>
                  <span>${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Shipping</span>
                  <span>${currentOrder.shipping_cost.toFixed(2)}</span>
                </div>
                {currentOrder.tax > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Tax</span>
                    <span>${currentOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                {currentOrder.discount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Discount</span>
                    <span>-${currentOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t font-bold">
                  <span>Total</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the order and it cannot be recovered. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default OrdersManagement;
