
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { Shield, Crown, User } from "lucide-react";

export const UserPermissionsBadge = () => {
  const { userRole, loading } = usePermissions();

  if (loading) {
    return <div className="h-6 w-16 bg-muted animate-pulse rounded" />;
  }

  const getRoleConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          icon: <Crown className="h-3 w-3" />,
          label: 'Admin',
          variant: 'destructive' as const,
        };
      case 'manager':
        return {
          icon: <Shield className="h-3 w-3" />,
          label: 'Gerente',
          variant: 'default' as const,
        };
      default:
        return {
          icon: <User className="h-3 w-3" />,
          label: 'Usuário',
          variant: 'secondary' as const,
        };
    }
  };

  const { icon, label, variant } = getRoleConfig();

  return (
    <Badge variant={variant} className="flex items-center gap-1 text-xs">
      {icon}
      {label}
    </Badge>
  );
};
