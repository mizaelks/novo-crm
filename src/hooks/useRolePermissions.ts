
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "./useErrorHandler";

interface Permission {
  id: string;
  permission_id: string;
  permission_name: string;
  description: string | null;
  admin_access: boolean;
  manager_access: boolean;
  user_access: boolean;
}

export const useRolePermissions = () => {
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['rolePermissions'],
    queryFn: async () => {
      console.log("Fetching role permissions from Supabase");
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('permission_name');

      if (error) {
        console.error("Error fetching role permissions:", error);
        throw error;
      }

      console.log("Role permissions fetched:", data);
      return data as Permission[];
    },
  });

  const hasPermission = (permissionId: string, userRole: 'admin' | 'manager' | 'user'): boolean => {
    const permission = permissions.find(p => p.permission_id === permissionId);
    if (!permission) return false;
    
    switch (userRole) {
      case 'admin':
        return permission.admin_access;
      case 'manager':
        return permission.manager_access;
      case 'user':
        return permission.user_access;
      default:
        return false;
    }
  };

  const getUserPermissions = (userRole: 'admin' | 'manager' | 'user'): string[] => {
    return permissions
      .filter(permission => {
        switch (userRole) {
          case 'admin':
            return permission.admin_access;
          case 'manager':
            return permission.manager_access;
          case 'user':
            return permission.user_access;
          default:
            return false;
        }
      })
      .map(permission => permission.permission_id);
  };

  const updatePermission = async (permissionId: string, role: 'admin' | 'manager' | 'user', value: boolean) => {
    try {
      console.log(`Updating permission ${permissionId} for role ${role} to ${value}`);
      
      const updateData: any = {};
      updateData[`${role}_access`] = value;
      
      const { error } = await supabase
        .from('role_permissions')
        .update(updateData)
        .eq('permission_id', permissionId);

      if (error) {
        console.error("Error updating permission:", error);
        throw error;
      }

      // Invalidar cache para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
      
      console.log("Permission updated successfully");
    } catch (error) {
      const errorMessage = handleError(error, "Erro ao atualizar permissão");
      throw new Error(errorMessage);
    }
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    getUserPermissions,
    updatePermission
  };
};
