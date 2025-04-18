import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoader } from "./ui/loading";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking the auth state
  if (loading) {
    return <FullPageLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 