
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Crown, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
    id: "view_shared_funnels",
    action: "Visualizar oportunidades em funis compartilhados",
    description: "Pode ver oportunidades em funis marcados como compartilhados",
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
    id: "edit_own_opportunities",
    action: "Editar próprias oportunidades",
    description: "Pode editar apenas suas próprias oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    id: "delete_opportunities",
    action: "Excluir oportunidades",
    description: "Pode excluir oportunidades (apenas próprias para usuários)",
    admin: true,
    manager: false,
    user: true
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
    id: "share_funnels",
    action: "Compartilhar funis",
    description: "Pode marcar funis como compartilhados",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "manage_stages",
    action: "Gerenciar estágios",
    description: "Pode criar, editar e configurar estágios dos funis",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "delete_funnels",
    action: "Excluir funis",
    description: "Pode excluir funis do sistema",
    admin: true,
    manager: false,
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
    id: "manage_roles",
    action: "Gerenciar roles",
    description: "Pode alterar papéis de outros usuários",
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
  },
  {
    id: "automation_settings",
    action: "Automação e arquivamento",
    description: "Pode configurar automações e políticas de arquivamento",
    admin: true,
    manager: true,
    user: false
  },
  {
    id: "view_reports",
    action: "Visualizar relatórios e insights",
    description: "Acesso aos relatórios e análises do sistema",
    admin: true,
    manager: true,
    user: true
  }
];

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
  const [customPermissions, setCustomPermissions] = useLocalStorage<Permission[]>("rolePermissions", defaultPermissions);
  const [permissions, setPermissions] = useState<Permission[]>(customPermissions);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionChange = (permissionId: string, role: 'admin' | 'manager' | 'user', value: boolean) => {
    const newPermissions = permissions.map(permission => 
      permission.id === permissionId 
        ? { ...permission, [role]: value }
        : permission
    );
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const saveChanges = () => {
    setCustomPermissions(permissions);
    setHasChanges(false);
    toast.success("Permissões atualizadas com sucesso!");
  };

  const resetToDefaults = () => {
    setPermissions(defaultPermissions);
    setCustomPermissions(defaultPermissions);
    setHasChanges(false);
    toast.success("Permissões restauradas para os valores padrão!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Editar Permissões por Papel</h3>
          <p className="text-sm text-muted-foreground">
            Configure as permissões específicas para cada papel no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button
            size="sm"
            onClick={saveChanges}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
          </p>
        </div>
      )}

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
                  {permissions.filter(p => p[role as keyof Permission] === true).length} permissões
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
          
          {permissions.map((permission, index) => (
            <div 
              key={permission.id} 
              className="px-4 py-3 grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-t text-sm hover:bg-muted/30"
            >
              <div>
                <div className="font-medium">{permission.action}</div>
                <div className="text-xs text-muted-foreground">{permission.description}</div>
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={permission.admin}
                  onCheckedChange={(value) => handlePermissionChange(permission.id, 'admin', value)}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={permission.manager}
                  onCheckedChange={(value) => handlePermissionChange(permission.id, 'manager', value)}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={permission.user}
                  onCheckedChange={(value) => handlePermissionChange(permission.id, 'user', value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p><strong>Importante:</strong> As alterações nas permissões são aplicadas localmente e afetam a interface do usuário.</p>
        <p>Para aplicar as permissões no backend, seria necessário implementar a lógica correspondente no banco de dados.</p>
        <p>Esta funcionalidade permite configurar quais recursos cada papel pode acessar na interface.</p>
      </div>
    </div>
  );
};
