
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { TemplateSelector } from "../customFields/TemplateSelector";
import { toast } from "sonner";
import { Tag } from "lucide-react";

interface FieldTemplateSelectorProps {
  requiredFields: RequiredField[];
  setRequiredFields: (fields: RequiredField[]) => void;
  stageId: string;
}

export const FieldTemplateSelector = ({
  requiredFields,
  setRequiredFields,
  stageId
}: FieldTemplateSelectorProps) => {
  const handleAddTemplateField = (field: RequiredField) => {
    // Check if a field with the same name already exists
    const exists = requiredFields.some(f => f.name === field.name);
    if (exists) {
      toast.warning(`Um campo com o nome "${field.name}" já existe`);
      return;
    }
    
    setRequiredFields([...requiredFields, field]);
    toast.success(`Campo "${field.name}" adicionado`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Modelos de campos pré-definidos</p>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        Selecione um modelo pré-definido ou crie um campo personalizado:
      </p>
      
      <TemplateSelector onSelectTemplate={handleAddTemplateField} stageId={stageId} />
    </div>
  );
};
