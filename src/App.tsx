import Cart from "./pages/customer/Cart";
import Dashboard from "./pages/admin/Dashboard";
import Footer from "./components/layout/Footer";
import Home from "./pages/customer/Home";
import Login from "./pages/auth/Login";
import Navbar from "./components/layout/Navbar";
import NotFound from "./pages/NotFound";
import OrdersManagement from "./pages/admin/OrdersManagement";
import OrdersPage from "./pages/customer/Orders";
import ProductDetail from "./pages/customer/ProductDetail";
import ProductsManagement from "./pages/admin/ProductsManagement";
import ProductsPage from "./pages/customer/ProductsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/auth/Register";
import UsersManagement from "./pages/admin/UsersManagement";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Customer Routes */}
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Protected Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <ProductsManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/orders" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <OrdersManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <UsersManagement />
                        </ProtectedRoute>
                      } 
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              <Toaster />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
      <Sonner />
    </>
  );
};

export default App;
