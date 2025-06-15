
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User, Shield, Crown, Check, X } from "lucide-react";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-4 w-4" />;
    case 'manager':
      return <Shield className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'manager':
      return 'Gerente';
    default:
      return 'Usuário';
  }
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'manager':
      return 'default' as const;
    default:
      return 'secondary' as const;
  }
};

const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => {
  return hasPermission ? (
    <Check className="h-4 w-4 text-green-600" />
  ) : (
    <X className="h-4 w-4 text-red-400" />
  );
};

export const RolePermissionsManagement = () => {
  const { permissions, isLoading } = useRolePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Permissões por Papel</h3>
        <p className="text-sm text-muted-foreground">
          Visão geral das permissões atribuídas a cada papel no sistema
        </p>
      </div>

      {/* Resumo dos Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['admin', 'manager', 'user'].map((role) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Badge variant={getRoleVariant(role)} className="flex items-center gap-1">
                  {getRoleIcon(role)}
                  {getRoleLabel(role)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {role === 'admin' && 'Controle total do sistema'}
                {role === 'manager' && 'Gerenciamento de negócios'}
                {role === 'user' && 'Usuário final do sistema'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium text-green-600">
                  {permissions.filter(p => p[`${role}_access` as keyof typeof p] === true).length} permissões
                </div>
                <div className="text-muted-foreground">
                  de {permissions.length} totais
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Tabela de Permissões */}
      <div className="space-y-4">
        <h4 className="font-medium">Matriz de Permissões</h4>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 text-sm font-medium">
            <div>Ação</div>
            <div className="flex items-center gap-2 justify-center">
              <Crown className="h-4 w-4" />
              Admin
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-4 w-4" />
              Gerente
            </div>
            <div className="flex items-center gap-2 justify-center">
              <User className="h-4 w-4" />
              Usuário
            </div>
          </div>
          
          {permissions.map((permission) => (
            <div 
              key={permission.permission_id} 
              className="px-4 py-3 grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-t text-sm hover:bg-muted/30"
            >
              <div>
                <div className="font-medium">{permission.permission_name}</div>
                <div className="text-xs text-muted-foreground">{permission.description}</div>
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.admin_access} />
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.manager_access} />
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.user_access} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Nota:</strong> As permissões são armazenadas no banco de dados e aplicadas em tempo real.</p>
        <p>Usuários com papel "user" só podem ver suas próprias oportunidades, exceto em funis compartilhados.</p>
        <p>Gerentes podem ver e editar todas as oportunidades, mas não podem gerenciar usuários.</p>
        <p>Administradores têm controle total sobre o sistema, incluindo gerenciamento de usuários e configurações.</p>
      </div>
    </div>
  );
};
