
import { TemplateManagement } from "@/components/settings/TemplateManagement";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Templates = () => {
  const { isAdmin } = useUserRole();

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Acesso restrito a administradores</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Templates</h1>
        <p className="text-muted-foreground">
          Configure templates de produtos, campos e tarefas para o sistema
        </p>
      </div>
      
      <TemplateManagement isAdmin={isAdmin} />
    </div>
  );
};

export default Templates;
