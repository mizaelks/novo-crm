
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User, Shield, Crown, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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

export const EditableRolePermissions = () => {
  const { permissions, isLoading, updatePermission } = useRolePermissions();
  const [updatingPermissions, setUpdatingPermissions] = useState<Record<string, boolean>>({});

  const handlePermissionChange = async (permissionId: string, role: 'admin' | 'manager' | 'user', value: boolean) => {
    const updateKey = `${permissionId}-${role}`;
    setUpdatingPermissions(prev => ({ ...prev, [updateKey]: true }));
    
    try {
      await updatePermission(permissionId, role, value);
      toast.success("Permissão atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar permissão");
      console.error("Error updating permission:", error);
    } finally {
      setUpdatingPermissions(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Editar Permissões por Papel</h3>
          <p className="text-sm text-muted-foreground">
            Configure as permissões específicas para cada papel no sistema
          </p>
        </div>
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

      {/* Tabela de Permissões Editáveis */}
      <div className="space-y-4">
        <h4 className="font-medium">Configurar Permissões</h4>
        
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
                <Switch
                  checked={permission.admin_access}
                  onCheckedChange={(value) => handlePermissionChange(permission.permission_id, 'admin', value)}
                  disabled={updatingPermissions[`${permission.permission_id}-admin`]}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={permission.manager_access}
                  onCheckedChange={(value) => handlePermissionChange(permission.permission_id, 'manager', value)}
                  disabled={updatingPermissions[`${permission.permission_id}-manager`]}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={permission.user_access}
                  onCheckedChange={(value) => handlePermissionChange(permission.permission_id, 'user', value)}
                  disabled={updatingPermissions[`${permission.permission_id}-user`]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p><strong>Importante:</strong> As alterações nas permissões são aplicadas diretamente no banco de dados.</p>
        <p>Estas configurações afetam o que cada papel pode acessar e fazer no sistema.</p>
        <p>As permissões são aplicadas em tempo real para todos os usuários com os respectivos papéis.</p>
      </div>
    </div>
  );
};
