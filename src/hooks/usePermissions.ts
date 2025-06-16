
import { useUserRole } from "./useUserRole";
import { useRolePermissions } from "./useRolePermissions";

export const usePermissions = () => {
  const { userRole, isAdmin, isManager, loading: roleLoading } = useUserRole();
  const { permissions, hasPermission: hasRolePermission, loading: permissionsLoading } = useRolePermissions();

  const loading = roleLoading || permissionsLoading;

  // Função principal para verificar permissões
  const hasPermission = (permissionId: string): boolean => {
    if (loading) return false;
    return hasRolePermission(permissionId, userRole);
  };

  // Função para verificar múltiplas permissões (OR)
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    if (loading) return false;
    return permissionIds.some(id => hasPermission(id));
  };

  // Função para verificar múltiplas permissões (AND)
  const hasAllPermissions = (permissionIds: string[]): boolean => {
    if (loading) return false;
    return permissionIds.every(id => hasPermission(id));
  };

  // Verificações específicas mais usadas
  const canViewAllOpportunities = hasPermission('view_all_opportunities');
  const canEditAllOpportunities = hasPermission('edit_all_opportunities');
  const canManageFunnels = hasPermission('manage_funnels');
  const canManageUsers = hasPermission('manage_users');
  const canDeleteOpportunities = hasPermission('delete_opportunities');
  const canSystemSettings = hasPermission('system_settings');
  const canViewReports = hasPermission('view_reports');

  return {
    // Estados básicos
    loading,
    userRole,
    isAdmin,
    isManager,
    permissions,

    // Funções de verificação
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Verificações específicas
    canViewAllOpportunities,
    canEditAllOpportunities,
    canManageFunnels,
    canManageUsers,
    canDeleteOpportunities,
    canSystemSettings,
    canViewReports,
  };
};
