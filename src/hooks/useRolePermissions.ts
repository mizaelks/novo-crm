
import { useLocalStorage } from "./useLocalStorage";

interface Permission {
  id: string;
  action: string;
  description: string;
  admin: boolean;
  manager: boolean;
  user: boolean;
}

const defaultPermissions: Permission[] = [
  {
    id: "view_all_opportunities",
    action: "Visualizar todas as oportunidades",
    description: "Pode ver oportunidades de todos os usuários",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "view_own_opportunities",
    action: "Visualizar próprias oportunidades",
    description: "Pode ver apenas suas próprias oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    id: "create_opportunities",
    action: "Criar oportunidades",
    description: "Pode criar novas oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    id: "edit_all_opportunities",
    action: "Editar todas as oportunidades",
    description: "Pode editar qualquer oportunidade do sistema",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "manage_funnels",
    action: "Gerenciar funis",
    description: "Pode criar, editar e configurar funis",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "manage_users",
    action: "Gerenciar usuários",
    description: "Pode criar, editar e excluir usuários",
    admin: true,
    manager: false,
    user: false
  },
  {
    id: "system_settings",
    action: "Configurações do sistema",
    description: "Acesso às configurações avançadas do sistema",
    admin: true,
    manager: true,
    user: false
  }
];

export const useRolePermissions = () => {
  const [permissions] = useLocalStorage<Permission[]>("rolePermissions", defaultPermissions);

  const hasPermission = (permissionId: string, userRole: 'admin' | 'manager' | 'user'): boolean => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return false;
    
    return permission[userRole] === true;
  };

  const getUserPermissions = (userRole: 'admin' | 'manager' | 'user'): string[] => {
    return permissions
      .filter(permission => permission[userRole] === true)
      .map(permission => permission.id);
  };

  return {
    permissions,
    hasPermission,
    getUserPermissions
  };
};
