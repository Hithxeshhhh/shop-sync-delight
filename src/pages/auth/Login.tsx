import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertBox } from "../../components/ui/alert-box";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isAttemptingAdminLogin, setIsAttemptingAdminLogin] = useState(false);
  
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user is trying to use admin credentials
  useEffect(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    setIsAttemptingAdminLogin(email === adminEmail);
  }, [email]);
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setNeedsVerification(false);
    
    try {
      await login(email, password);
      // The navigation to home page is handled in the AuthContext after successful login
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if the error is related to email verification
      if (err.message?.includes('Email not confirmed') || 
          err.message?.includes('not verified') || 
          err.message?.includes('Please verify your email')) {
        setNeedsVerification(true);
      } else if (isAttemptingAdminLogin) {
        // Special messaging for admin login
        setError('Admin password incorrect. Please check your credentials.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
      
      setIsLoading(false);
    }
  };
  
  const handleUseAdmin = () => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      setEmail(adminEmail);
      setPassword(adminPassword);
    } else {
      toast({
        title: "Error",
        description: "Admin credentials not configured in environment variables",
        variant: "destructive",
      });
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsResendingEmail(true);
    
    try {
      await resendVerificationEmail(email);
      toast({
        title: "Verification Email Sent",
        description: "We've sent a new verification email to your inbox.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsResendingEmail(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
              
              {needsVerification && (
                <AlertBox variant="warning" title="Email Verification Required">
                  <p>Please verify your email address before logging in.</p>
                  <p className="mt-2">Check your inbox for the verification link or click below to resend it.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResendVerification}
                    disabled={isResendingEmail}
                    className="mt-2"
                  >
                    {isResendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </AlertBox>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Demo Accounts:</p>
                  <p>User: user@example.com / password</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleUseAdmin}
                  >
                    Use Admin
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
