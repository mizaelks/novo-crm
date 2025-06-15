
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { User, Shield, Crown, Save } from "lucide-react";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface UserWithRole {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface UserRoleManagementProps {
  users: UserWithRole[];
  onUserUpdated: () => void;
}

export const UserRoleManagement = ({ users, onUserUpdated }: UserRoleManagementProps) => {
  const [editingRoles, setEditingRoles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { handleError } = useErrorHandler();

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

  const handleRoleChange = (userId: string, newRole: string) => {
    setEditingRoles(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const saveUserRole = async (userId: string) => {
    const newRole = editingRoles[userId];
    if (!newRole) return;

    setSaving(prev => ({ ...prev, [userId]: true }));
    
    try {
      console.log(`Atualizando papel do usuário ${userId} para ${newRole}`);
      
      // Primeiro, remover papel atual
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error("Erro ao remover papel atual:", deleteError);
        throw deleteError;
      }

      // Então, adicionar novo papel
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) {
        console.error("Erro ao adicionar novo papel:", insertError);
        throw insertError;
      }

      toast.success("Papel do usuário atualizado com sucesso!");
      
      // Limpar estado de edição
      setEditingRoles(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      
      // Recarregar dados
      onUserUpdated();
    } catch (error) {
      console.error("Erro ao atualizar papel do usuário:", error);
      const errorMessage = handleError(error, "Erro ao atualizar papel do usuário");
      toast.error(errorMessage);
    } finally {
      setSaving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const cancelEdit = (userId: string) => {
    setEditingRoles(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Gerencie os papéis e permissões dos usuários do sistema
      </div>
      
      <div className="space-y-3">
        {users.map((user) => {
          const isEditing = editingRoles[user.id] !== undefined;
          const currentRole = isEditing ? editingRoles[user.id] : user.role;
          const isSaving = saving[user.id];
          
          return (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Select
                      value={currentRole}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Usuário
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Gerente
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => saveUserRole(user.id)}
                        disabled={isSaving || currentRole === user.role}
                      >
                        {isSaving ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit(user.id)}
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Badge 
                      variant={getRoleVariant(user.role)} 
                      className="flex items-center gap-1"
                    >
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRoleChange(user.id, user.role)}
                    >
                      Editar Papel
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
