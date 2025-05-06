
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
    toast.success("Campo adicionado");
  };

  const handleRemoveField = (fieldId: string) => {
    setRequiredFields(requiredFields.filter(field => field.id !== fieldId));
    toast.success("Campo removido");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Campos obrigatórios</h3>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setAddingField(true)}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Campo personalizado
          </Button>
        </div>
      </div>
      
      <Card className="mb-4">
        <CardContent className="pt-4">
          <FieldTemplateSelector
            requiredFields={requiredFields}
            setRequiredFields={setRequiredFields}
            stageId={stageId}
          />
        </CardContent>
      </Card>
      
      {addingField && (
        <Card className="mb-4 border-dashed">
          <CardContent className="pt-4 pb-4">
            <FieldCreationForm
              onAddField={handleAddRequiredField}
              onCancel={() => setAddingField(false)}
              stageId={stageId}
            />
          </CardContent>
        </Card>
      )}
      
      <FieldList 
        fields={requiredFields}
        onRemoveField={handleRemoveField}
      />
    </div>
  );
};

export default StageRequiredFields;
