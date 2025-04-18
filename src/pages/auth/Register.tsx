import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertBox } from "../../components/ui/alert-box";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(5); // 5 second countdown
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    let timer: number;
    
    if (isRegistered && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isRegistered && countdown === 0) {
      navigate('/login');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRegistered, countdown, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      
      setIsRegistered(true);
      setIsLoading(false);
      
      // Show toast notification
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please check your email for verification.",
      });
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Registration Successful</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <AlertBox variant="success" title="Email Verification Required">
                <p>We've sent a confirmation email to <strong>{email}</strong>.</p>
                <p className="mt-2">Please check your inbox and click the verification link to activate your account.</p>
              </AlertBox>
              
              <div className="text-center mt-4">
                <p>Redirecting to login page in {countdown} seconds...</p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create an account
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
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
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
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
