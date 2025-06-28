
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * AdminUserAssignment allows assigning admin roles to users
 * This is critical for the initial admin setup
 */
export const AdminUserAssignment: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const { toast } = useToast();

  const checkAdminCount = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin');
      
      if (error) throw error;
      setAdminCount(data?.length || 0);
    } catch (error) {
      console.error('Error checking admin count:', error);
    }
  };

  React.useEffect(() => {
    checkAdminCount();
  }, []);

  const assignAdminRole = async () => {
    if (!userId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid user ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_user_id: userId.trim()
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Admin Role Assigned",
          description: "User has been successfully assigned admin role"
        });
        setUserId('');
        checkAdminCount();
      } else {
        toast({
          title: "Assignment Failed",
          description: "Could not assign admin role. Check permissions.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isEmergencyMode = adminCount === 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Role Assignment
        </CardTitle>
        <CardDescription>
          Assign administrative privileges to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmergencyMode && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Emergency Mode:</strong> No admin users exist. Any user can assign the first admin role.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label htmlFor="userId" className="text-sm font-medium">
            User ID
          </label>
          <Input
            id="userId"
            type="text"
            placeholder="Enter user UUID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Enter the UUID of the user you want to make an admin
          </p>
        </div>

        <Button
          onClick={assignAdminRole}
          disabled={loading || !userId.trim()}
          className="w-full"
        >
          {loading ? 'Assigning...' : 'Assign Admin Role'}
        </Button>

        {adminCount !== null && (
          <div className="text-sm text-gray-600 text-center">
            Current admin users: {adminCount}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
