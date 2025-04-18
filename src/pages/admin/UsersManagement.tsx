import AdminLayout from "../../components/layout/AdminLayout";
import { AlertCircle, Edit, Plus, Trash, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AlertBox } from "../../components/ui/alert-box";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminUsers } from "../../lib/supabase-admin";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  user_id: string;
};

const UsersManagement = () => {
  const { user, createAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New admin form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Admin users list
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  
  // Load admin users from API
  useEffect(() => {
    loadAdminUsers();
  }, []);
  
  const loadAdminUsers = async () => {
    setFetchingUsers(true);
    try {
      // Fetch admin users from Supabase
      const adminsData = await getAdminUsers();
      
      if (adminsData) {
        setAdminUsers(adminsData);
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin users',
        variant: 'destructive',
      });
    } finally {
      setFetchingUsers(false);
    }
  };
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await createAdmin(name, email, password);
      
      // Show success message
      setSuccess(`Admin user ${name} (${email}) created successfully`);
      toast({
        title: 'Success',
        description: 'New admin user created successfully',
      });
      
      // Reload admin users
      await loadAdminUsers();
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to create admin user');
      console.error('Error creating admin:', err);
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Admin Users Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Admin Users</span>
              </CardTitle>
              <CardDescription>
                Manage administrator accounts for your application
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {fetchingUsers ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading admin users...</p>
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No admin users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-4">Name</div>
                      <div className="col-span-6">Email</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    
                    <div className="divide-y">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="grid grid-cols-12 p-3 text-sm">
                          <div className="col-span-4">{admin.name}</div>
                          <div className="col-span-6">{admin.email}</div>
                          <div className="col-span-2 flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              title="Edit admin"
                              disabled={true} // Disabled for now
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              title="Remove admin privileges"
                              disabled={true} // Disabled for now
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadAdminUsers}
                    className="w-full"
                  >
                    Refresh Admin List
                  </Button>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> All admin users are stored in the Supabase database and have full access to the admin dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <span>Create New Admin</span>
              </CardTitle>
              <CardDescription>
                Create a new admin user with full access
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleCreateAdmin}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}
                
                {success && (
                  <AlertBox variant="success" title="Admin Created">
                    {success}
                  </AlertBox>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Admin User
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Current Admin</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm">{user?.name || 'Admin User'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">
                    {user?.id === 'admin-env' ? 'Environment-based Admin' : 'Database Admin'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersManagement; 