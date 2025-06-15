
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Crown, Check, X } from "lucide-react";

interface Permission {
  action: string;
  description: string;
  admin: boolean;
  manager: boolean;
  user: boolean;
}

const permissions: Permission[] = [
  {
    action: "Visualizar todas as oportunidades",
    description: "Pode ver oportunidades de todos os usuários",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Visualizar próprias oportunidades",
    description: "Pode ver apenas suas próprias oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    action: "Visualizar oportunidades em funis compartilhados",
    description: "Pode ver oportunidades em funis marcados como compartilhados",
    admin: true,
    manager: true,
    user: true
  },
  {
    action: "Criar oportunidades",
    description: "Pode criar novas oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    action: "Editar todas as oportunidades",
    description: "Pode editar qualquer oportunidade do sistema",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Editar próprias oportunidades",
    description: "Pode editar apenas suas próprias oportunidades",
    admin: true,
    manager: true,
    user: true
  },
  {
    action: "Excluir oportunidades",
    description: "Pode excluir oportunidades (apenas próprias para usuários)",
    admin: true,
    manager: false,
    user: true
  },
  {
    action: "Gerenciar funis",
    description: "Pode criar, editar e configurar funis",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Compartilhar funis",
    description: "Pode marcar funis como compartilhados",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Gerenciar estágios",
    description: "Pode criar, editar e configurar estágios dos funis",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Excluir funis",
    description: "Pode excluir funis do sistema",
    admin: true,
    manager: false,
    user: false
  },
  {
    action: "Gerenciar usuários",
    description: "Pode criar, editar e excluir usuários",
    admin: true,
    manager: false,
    user: false
  },
  {
    action: "Gerenciar roles",
    description: "Pode alterar papéis de outros usuários",
    admin: true,
    manager: false,
    user: false
  },
  {
    action: "Configurações do sistema",
    description: "Acesso às configurações avançadas do sistema",
    admin: true,
    manager: true,
    user: false
  },
  {
    action: "Automação e arquivamento",
    description: "Pode configurar automações e políticas de arquivamento",
    admin: true,
    manager: true,
    user: false
  },
  {
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

const PermissionIcon = ({ hasPermission }: { hasPermission: boolean }) => {
  return hasPermission ? (
    <Check className="h-4 w-4 text-green-600" />
  ) : (
    <X className="h-4 w-4 text-red-400" />
  );
};

export const RolePermissionsManagement = () => {
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
          
          {permissions.map((permission, index) => (
            <div 
              key={index} 
              className="px-4 py-3 grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 border-t text-sm hover:bg-muted/30"
            >
              <div>
                <div className="font-medium">{permission.action}</div>
                <div className="text-xs text-muted-foreground">{permission.description}</div>
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.admin} />
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.manager} />
              </div>
              <div className="flex justify-center">
                <PermissionIcon hasPermission={permission.user} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Nota:</strong> As permissões são aplicadas através de Row Level Security (RLS) no banco de dados.</p>
        <p>Usuários com papel "user" só podem ver suas próprias oportunidades, exceto em funis compartilhados.</p>
        <p>Gerentes podem ver e editar todas as oportunidades, mas não podem gerenciar usuários.</p>
        <p>Administradores têm controle total sobre o sistema, incluindo gerenciamento de usuários e configurações.</p>
      </div>
    </div>
  );
};
