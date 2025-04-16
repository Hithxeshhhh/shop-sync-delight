
import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

type AdminLayoutProps = {
  children: ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Redirect non-admin users
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== '/admin' && location.pathname.startsWith(path));
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-sidebar border-b md:border-r md:border-b-0 md:min-h-screen">
        <div className="p-4">
          <Link to="/" className="flex items-center">
            <span className="text-lg font-bold">ShopSync Admin</span>
          </Link>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href) 
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
            
            <li className="pt-4 mt-4 border-t">
              <button
                onClick={logout}
                className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
