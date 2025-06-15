
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_TASK_TEMPLATES } from "@/types/taskTemplates";
import { FIELD_TEMPLATES } from "@/components/customFields/CustomFieldTemplates";
import { FieldTemplatesSection } from "./templateManagement/components/FieldTemplatesSection";
import { TaskTemplatesSection } from "./templateManagement/components/TaskTemplatesSection";
import { ProductManagement } from "./ProductManagement";

interface TemplateManagementProps {
  isAdmin: boolean;
}

export const TemplateManagement = ({ isAdmin }: TemplateManagementProps) => {
  const [fieldTemplates, setFieldTemplates] = useState(FIELD_TEMPLATES);
  const [taskTemplates, setTaskTemplates] = useState(DEFAULT_TASK_TEMPLATES);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="products" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="products">Produtos</TabsTrigger>
        <TabsTrigger value="fields">Campos</TabsTrigger>
        <TabsTrigger value="tasks">Tarefas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products">
        <ProductManagement isAdmin={isAdmin} />
      </TabsContent>
      
      <TabsContent value="fields">
        <FieldTemplatesSection 
          fieldTemplates={fieldTemplates}
          setFieldTemplates={setFieldTemplates}
        />
      </TabsContent>
      
      <TabsContent value="tasks">
        <TaskTemplatesSection 
          taskTemplates={taskTemplates}
          setTaskTemplates={setTaskTemplates}
        />
      </TabsContent>
    </Tabs>
  );
};
