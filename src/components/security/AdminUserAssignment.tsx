
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Users, AlertTriangle } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

/**
 * AdminUserAssignment provides interface for managing admin users
 */
export const AdminUserAssignment: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<UserRole[]>([]);
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Failed to Load Admin Users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignAdminRole = async () => {
    if (!newAdminUserId.trim()) {
      toast({
        title: "User ID Required",
        description: "Please enter a valid user ID",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssigning(true);
      
      // Call the secure function to assign admin role
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_user_id: newAdminUserId.trim()
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Admin Role Assigned",
          description: `Successfully assigned admin role to user ${newAdminUserId}`
        });
        setNewAdminUserId('');
        fetchAdminUsers(); // Refresh the list
      } else {
        toast({
          title: "Assignment Failed",
          description: "You don't have permission to assign admin roles, or the user doesn't exist",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 animate-pulse" />
            <span>Loading admin users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Admin Users
          </CardTitle>
          <CardDescription>
            Users with administrative access to security functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>CRITICAL:</strong> No admin users found! This is a security risk.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {adminUsers.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-mono text-sm">{admin.user_id}</span>
                    <Badge variant="default" className="ml-2">
                      {admin.role}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    Added: {new Date(admin.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Admin Role
          </CardTitle>
          <CardDescription>
            Add administrative access to a user (requires existing admin permissions)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID (UUID format)"
              value={newAdminUserId}
              onChange={(e) => setNewAdminUserId(e.target.value)}
              className="font-mono"
            />
            <Button
              onClick={assignAdminRole}
              disabled={assigning || !newAdminUserId.trim()}
            >
              {assigning ? 'Assigning...' : 'Assign Admin'}
            </Button>
          </div>
          
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>Note:</strong> You can find user IDs in the Supabase dashboard under Authentication → Users.
              Only existing admins can assign new admin roles, or this can be done if no admins exist yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
