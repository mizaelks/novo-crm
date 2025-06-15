
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { UserInviteDialog } from "./UserInviteDialog";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Shield, User, Crown, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface UserManagementDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const UserManagementDialog = ({ isOpen, setIsOpen }: UserManagementDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      handleError(error, "Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      // Remover perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      toast.success("Usuário removido com sucesso!");
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      handleError(error, "Erro ao remover usuário");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerenciar Usuários
          </DialogTitle>
          <DialogDescription>
            Adicione, remova e gerencie os usuários do sistema.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-3 gap-4 py-4 items-center">
                  <div className="col-span-2">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <Badge variant="secondary" className="flex items-center gap-1 mt-1 w-fit">
                      <User className="h-4 w-4" />
                      Usuário
                    </Badge>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => setIsInviteOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>

      <UserInviteDialog
        isOpen={isInviteOpen}
        setIsOpen={setIsInviteOpen}
        onUserInvited={loadUsers}
      />
    </Dialog>
  );
};
