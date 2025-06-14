
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'manager' | 'user';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserRole();
    } else {
      setUserRole('user');
      setIsAdmin(false);
      setIsManager(false);
      setLoading(false);
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const role = data?.role || 'user';
      setUserRole(role);
      setIsAdmin(role === 'admin');
      setIsManager(role === 'manager' || role === 'admin');
    } catch (error) {
      console.error("Error checking user role:", error);
      setUserRole('user');
      setIsAdmin(false);
      setIsManager(false);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    const roleHierarchy = { user: 0, manager: 1, admin: 2 };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  return {
    userRole,
    isAdmin,
    isManager,
    loading,
    hasPermission,
    refetch: checkUserRole
  };
};
