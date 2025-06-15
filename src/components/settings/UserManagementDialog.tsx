
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useUserRole } from "@/hooks/useUserRole";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserRoleManagement } from "./UserRoleManagement";
import { supabase } from "@/integrations/supabase/client";
import { User, Shield, Crown, Trash2, Edit, Plus, AlertTriangle, Users, Settings } from "lucide-react";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface UserManagementDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const UserManagementDialog = ({ isOpen, setIsOpen }: UserManagementDialogProps) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadUsers();
    }
  }, [isOpen, isAdmin]);

  // Só admins podem acessar este diálogo
  if (!isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Apenas administradores podem gerenciar usuários.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log("Carregando usuários...");
      
      // Primeiro, buscar todos os perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true });

      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }

      console.log("Perfis encontrados:", profilesData);

      // Em seguida, buscar os papéis de cada usuário
      const userPromises = (profilesData || []).map(async (profile) => {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error(`Erro ao buscar papel do usuário ${profile.id}:`, roleError);
        }

        return {
          id: profile.id,
          email: profile.email || '',
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: roleData?.role || 'user',
        } as UserWithRole;
      });

      const mappedUsers = await Promise.all(userPromises);
      console.log("Usuários mapeados:", mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Erro geral ao carregar usuários:", error);
      const errorMessage = handleError(error, "Erro ao carregar usuários");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      console.log("Removendo usuário:", userId);
      
      // Primeiro remover papel do usuário
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error("Erro ao remover papel:", roleError);
        throw roleError;
      }

      // Remover perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error("Erro ao remover perfil:", profileError);
        throw profileError;
      }

      toast.success("Usuário removido com sucesso!");
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      const errorMessage = handleError(error, "Erro ao remover usuário");
      toast.error(errorMessage);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerenciar Usuários
          </DialogTitle>
          <DialogDescription>
            Crie, edite, remova e gerencie os usuários e suas permissões no sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <ScrollArea className="h-[400px] space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-4 gap-4 py-4 items-center">
                      <div className="col-span-2">
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <Badge 
                          variant={getRoleVariant(user.role)} 
                          className="flex items-center gap-1 mt-1 w-fit"
                        >
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end pt-6">
              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <UserRoleManagement 
                  users={users}
                  onUserUpdated={loadUsers}
                />
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <CreateUserDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        onUserCreated={loadUsers}
      />

      {editingUser && (
        <EditUserDialog
          isOpen={!!editingUser}
          setIsOpen={(open) => !open && setEditingUser(null)}
          user={editingUser}
          onUserUpdated={loadUsers}
        />
      )}
    </Dialog>
  );
};
