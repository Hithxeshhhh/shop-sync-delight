import { AuthError, PostgrestError, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Creates a new admin user with the provided details
 */
export const createAdminUser = async (
  name: string,
  email: string,
  password: string
): Promise<User | null> => {
  try {
    // First try to create the user with admin APIs
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        isAdmin: true,
      },
    });

    if (authError) {
      console.warn('Admin API failed, falling back to regular signup:', authError);
      
      // If admin API fails, fall back to regular signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin: true,
          },
        },
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('Failed to create user');
      
      // Insert into admins table
      await addUserToAdminsTable(data.user.id, name, email);
      
      return data.user;
    }
    
    if (!authData.user) throw new Error('Failed to create admin user');
    
    // Add user to admins table
    await addUserToAdminsTable(authData.user.id, name, email);
    
    return authData.user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Helper function to add a user to the admins table
 */
const addUserToAdminsTable = async (userId: string, name: string, email: string): Promise<void> => {
  const { error } = await supabase.from('admins').insert({
    id: userId,
    user_id: userId, // Using the same ID for both id and user_id fields
    name,
    email,
    created_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error('Error adding user to admins table:', error);
    throw error;
  }
};

/**
 * Gets all admin users from the database
 */
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Checks if a user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check if user exists in admins table using user_id field
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Removes admin privileges from a user
 */
export const removeAdminUser = async (userId: string): Promise<void> => {
  try {
    // Remove from admins table
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Update user metadata to remove isAdmin flag
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          isAdmin: false 
        } 
      }
    );
    
    if (updateError) {
      console.warn('Could not update user metadata:', updateError);
    }
    
  } catch (error) {
    console.error('Error removing admin user:', error);
    throw error;
  }
};

/**
 * Updates an admin user's information
 */
export const updateAdminUser = async (
  userId: string, 
  updates: { name?: string; email?: string }
): Promise<void> => {
  try {
    // Update in admins table
    const { error } = await supabase
      .from('admins')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // If email is being updated, update auth record too
    if (updates.email) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: updates.email }
      );
      
      if (updateError) throw updateError;
    }
    
    // Update user metadata if name is provided
    if (updates.name) {
      const { data } = await supabase.auth.admin.getUserById(userId);
      
      if (data?.user) {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          userId,
          { 
            user_metadata: { 
              ...data.user.user_metadata,
              name: updates.name 
            } 
          }
        );
        
        if (metadataError) {
          console.warn('Could not update user metadata:', metadataError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
}; 