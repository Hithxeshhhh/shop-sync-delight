import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background/95 backdrop-blur">
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">ShopSync</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your one-stop shop for quality products at affordable prices.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} ShopSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
