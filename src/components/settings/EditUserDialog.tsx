
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { validateData } from "@/utils/validation";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const editUserSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email deve ter um formato válido"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface EditUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  onUserUpdated: () => void;
}

export const EditUserDialog = ({ isOpen, setIsOpen, user, onUserUpdated }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateData(editUserSchema, formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.errors?.forEach(error => {
        const field = error.toLowerCase().includes('email') ? 'email' :
                     error.toLowerCase().includes('nome') ? 'firstName' :
                     error.toLowerCase().includes('sobrenome') ? 'lastName' : 'general';
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Atualizando usuário:", user.id, formData);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success("Usuário atualizado com sucesso!");
      setIsOpen(false);
      onUserUpdated();
    } catch (error) {
      handleError(error, "Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof EditUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription>
            Edite as informações do usuário selecionado.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nome"
            name="firstName"
            value={formData.firstName}
            onChange={(value) => updateField("firstName", value as string)}
            error={errors.firstName}
            placeholder="Digite o nome"
            required
            maxLength={50}
          />
          
          <FormField
            label="Sobrenome"
            name="lastName"
            value={formData.lastName}
            onChange={(value) => updateField("lastName", value as string)}
            error={errors.lastName}
            placeholder="Digite o sobrenome"
            required
            maxLength={50}
          />
          
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value as string)}
            error={errors.email}
            placeholder="usuario@exemplo.com"
            required
            disabled
          />
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
