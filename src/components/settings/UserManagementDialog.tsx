
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Crown, Shield, User, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import CreateUserDialog from "./CreateUserDialog";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  user_roles: {
    role: 'admin' | 'manager' | 'user';
  }[];
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserManagementDialog = ({ open, onOpenChange }: UserManagementDialogProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      loadUsers();
      checkAdminStatus();
    }
  }, [open]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          avatar_url,
          created_at,
          user_roles (
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'user') => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem alterar papéis");
      return;
    }

    try {
      // Primeiro, remover papel atual
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Então, adicionar novo papel
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: user?.id
        });

      if (error) throw error;

      toast.success("Papel do usuário atualizado com sucesso");
      loadUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Erro ao atualizar papel do usuário");
    }
  };

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
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

  const getUserInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return email;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários e Permissões
              </DialogTitle>
              {isAdmin && (
                <Button
                  onClick={() => setCreateUserOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Criar Usuário
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {!isAdmin && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Shield className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Você tem acesso de visualização. Apenas administradores podem alterar papéis.
                </span>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((profile) => {
                  const currentRole = profile.user_roles[0]?.role || 'user';
                  
                  return (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={profile.avatar_url || ''} />
                              <AvatarFallback>
                                {getUserInitials(profile.first_name, profile.last_name, profile.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {getUserDisplayName(profile.first_name, profile.last_name, profile.email)}
                              </p>
                              <p className="text-sm text-muted-foreground">{profile.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Cadastrado em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge variant={getRoleBadgeVariant(currentRole)} className="flex items-center gap-1">
                              {getRoleIcon(currentRole)}
                              {getRoleLabel(currentRole)}
                            </Badge>
                            
                            {isAdmin && profile.id !== user?.id && (
                              <Select
                                value={currentRole}
                                onValueChange={(value: 'admin' | 'manager' | 'user') => 
                                  updateUserRole(profile.id, value)
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuário</SelectItem>
                                  <SelectItem value="manager">Gerente</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descrição dos Papéis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Administrador</p>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo ao sistema, pode gerenciar usuários e todas as configurações.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Gerente</p>
                    <p className="text-sm text-muted-foreground">
                      Pode gerenciar funis, oportunidades e visualizar relatórios avançados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Usuário</p>
                    <p className="text-sm text-muted-foreground">
                      Acesso básico para visualizar e editar oportunidades atribuídas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onUserCreated={loadUsers}
      />
    </>
  );
};

export default UserManagementDialog;
