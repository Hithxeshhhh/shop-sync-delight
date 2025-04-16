
import { useProducts } from '../../contexts/ProductContext';
import { useOrders } from '../../contexts/OrderContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

const Dashboard = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  
  const totalInventory = products.reduce((total, product) => total + product.stock, 0);
  const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
  const lowStockProducts = products.filter(product => product.stock < 5);
  
  // Group orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <Package className="h-6 w-6" />
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCart className="h-6 w-6" />
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Total Inventory',
      value: totalInventory,
      icon: <Users className="h-6 w-6" />
    }
  ];
  
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="bg-primary/10 p-2 rounded-full">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className={`text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground">No low stock products.</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                        {product.stock} in stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-blue-500';
    case 'processing':
      return 'text-yellow-500';
    case 'shipped':
      return 'text-purple-500';
    case 'delivered':
      return 'text-green-500';
    case 'cancelled':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

export default Dashboard;
