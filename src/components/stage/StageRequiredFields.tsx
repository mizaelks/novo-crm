
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { PlusCircle, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FieldTemplateSelector } from "./FieldTemplateSelector";
import { FieldCreationForm } from "./FieldCreationForm";
import { FieldList } from "./FieldList";

interface StageRequiredFieldsProps {
  requiredFields: RequiredField[];
  setRequiredFields: (fields: RequiredField[]) => void;
  stageId: string;
}

const StageRequiredFields = ({
  requiredFields,
  setRequiredFields,
  stageId
}: StageRequiredFieldsProps) => {
  const [addingField, setAddingField] = useState(false);

  const handleAddRequiredField = (newField: RequiredField) => {
    setRequiredFields([...requiredFields, newField]);
    setAddingField(false);
    toast.success("Campo adicionado com sucesso");
  };

  const handleRemoveField = (fieldId: string) => {
    setRequiredFields(requiredFields.filter(field => field.id !== fieldId));
    toast.success("Campo removido com sucesso");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Campos obrigatórios</h3>
            <p className="text-xs text-muted-foreground">
              Configure campos que devem ser preenchidos nesta etapa
            </p>
          </div>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setAddingField(true)}
          className="gap-1 flex-shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Campo personalizado
        </Button>
      </div>
      
      <FieldTemplateSelector
        requiredFields={requiredFields}
        setRequiredFields={setRequiredFields}
        stageId={stageId}
      />
      
      {addingField && (
        <FieldCreationForm
          onAddField={handleAddRequiredField}
          onCancel={() => setAddingField(false)}
          stageId={stageId}
        />
      )}
      
      <FieldList 
        fields={requiredFields}
        onRemoveField={handleRemoveField}
      />
    </div>
  );
};

export default StageRequiredFields;
