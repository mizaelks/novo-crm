
import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
  children: ReactNode;
}

export const PermissionGate = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showTooltip = false,
  tooltipMessage = "Você não tem permissão para acessar esta funcionalidade",
  children
}: PermissionGateProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true; // Se nenhuma permissão especificada, permite acesso
  }

  if (!hasAccess) {
    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="opacity-50 cursor-not-allowed">
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
