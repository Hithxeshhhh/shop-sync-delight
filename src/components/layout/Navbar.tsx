import { LogOut, Package, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Function to get user's first name
  const getFirstName = () => {
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">ShopSync</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Products
            </Link>
            {user && (
              <Link to="/orders" className="text-sm font-medium transition-colors hover:text-primary">
                My Orders
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Cart icon always shown */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* User's email and first name with avatar when logged in */}
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">
                    {getFirstName() || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    {user.email || ''}
                  </span>
                </div>
              </div>
              
              {/* Mobile only - just show avatar */}
              <div className="sm:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Action Buttons when logged in */}
              <div className="flex gap-1">
                {user && (
                  <Link to="/orders">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Package className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8" title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Login/Register buttons when logged out */
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
