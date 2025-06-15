
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email deve ter um formato válido"),
  role: z.enum(["admin", "manager", "user"]),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface UserInviteDialogProps {
  onInviteUser: (userData: InviteFormData) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const UserInviteDialog = ({ onInviteUser, isOpen, setIsOpen }: UserInviteDialogProps) => {
  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    role: "user",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { handleError } = useErrorHandler();

  const resetForm = () => {
    setFormData({
      email: "",
      role: "user",
      firstName: "",
      lastName: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateData(inviteSchema, formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.errors?.forEach(error => {
        const field = error.toLowerCase().includes('email') ? 'email' :
                     error.toLowerCase().includes('nome') ? 'firstName' :
                     error.toLowerCase().includes('sobrenome') ? 'lastName' :
                     error.toLowerCase().includes('role') ? 'role' : 'general';
        newErrors[field] = error;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onInviteUser(validation.data!);
      toast.success("Convite enviado com sucesso!");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      handleError(error, "Erro ao enviar convite");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof InviteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Convidar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convidar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para um novo usuário se juntar ao sistema.
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
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Papel <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "manager" | "user") => updateField("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário - Acesso básico</SelectItem>
                <SelectItem value="manager">Gerente - Pode gerenciar funis e etapas</SelectItem>
                <SelectItem value="admin">Admin - Acesso total</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>
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
              <Mail className="h-4 w-4" />
            )}
            {isLoading ? "Enviando..." : "Enviar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
