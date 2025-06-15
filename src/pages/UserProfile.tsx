
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormField } from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useUserRole } from "@/hooks/useUserRole";
import { validateData } from "@/utils/validation";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Save, User, Shield, Crown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email deve ter um formato válido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { user } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || user.email || "",
        });
      } else {
        // Se não há perfil, usar dados do auth
        setFormData({
          firstName: "",
          lastName: "",
          email: user.email || "",
        });
      }
    } catch (error) {
      handleError(error, "Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateData(profileSchema, formData);
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

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        });

      if (error) {
        throw error;
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      handleError(error, "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'manager':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (userRole) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
    }
    return formData.email.substring(0, 2).toUpperCase();
  };

  if (loading || roleLoading) {
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName} ${formData.lastName}`
                    : formData.email
                  }
                </h2>
                <Badge variant={getRoleBadgeVariant()} className="flex items-center gap-1 w-fit">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Nome"
                name="firstName"
                value={formData.firstName}
                onChange={(value) => updateField("firstName", value as string)}
                error={errors.firstName}
                placeholder="Digite seu nome"
                required
                maxLength={50}
              />
              
              <FormField
                label="Sobrenome"
                name="lastName"
                value={formData.lastName}
                onChange={(value) => updateField("lastName", value as string)}
                error={errors.lastName}
                placeholder="Digite seu sobrenome"
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
                placeholder="seu@email.com"
                required
                disabled
              />
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
