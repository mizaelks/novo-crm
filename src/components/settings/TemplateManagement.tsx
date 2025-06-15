
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_TASK_TEMPLATES } from "@/types/taskTemplates";
import { FIELD_TEMPLATES } from "@/components/customFields/CustomFieldTemplates";
import { FieldTemplatesSection } from "./templateManagement/components/FieldTemplatesSection";
import { TaskTemplatesSection } from "./templateManagement/components/TaskTemplatesSection";

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
    <div className="space-y-6">
      <FieldTemplatesSection 
        fieldTemplates={fieldTemplates}
        setFieldTemplates={setFieldTemplates}
      />
      
      <TaskTemplatesSection 
        taskTemplates={taskTemplates}
        setTaskTemplates={setTaskTemplates}
      />
    </div>
  );
};
