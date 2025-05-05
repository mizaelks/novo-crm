
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequiredField } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { TemplateSelector } from "../customFields/TemplateSelector";

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
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "checkbox" | "select">("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  const handleAddRequiredField = () => {
    if (!newFieldName.trim()) {
      toast.error("O nome do campo é obrigatório");
      return;
    }

    const newField: RequiredField = {
      id: crypto.randomUUID(),
      name: newFieldName.trim(),
      type: newFieldType,
      isRequired: true,
      stageId: stageId
    };

    // Add options for select fields
    if (newFieldType === "select" && newFieldOptions) {
      newField.options = newFieldOptions.split(",").map(option => option.trim());
    }

    setRequiredFields([...requiredFields, newField]);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
    setAddingField(false);
    toast.success("Campo adicionado");
  };

  const handleRemoveField = (fieldId: string) => {
    setRequiredFields(requiredFields.filter(field => field.id !== fieldId));
    toast.success("Campo removido");
  };
  
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Campos obrigatórios</h3>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setAddingField(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Campo personalizado
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <TemplateSelector onSelectTemplate={handleAddTemplateField} stageId={stageId} />
      </div>
      
      {addingField && (
        <div className="border rounded-md p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FormLabel>Nome do campo</FormLabel>
              <Input 
                value={newFieldName} 
                onChange={e => setNewFieldName(e.target.value)} 
                placeholder="Ex: Valor da proposta"
              />
            </div>
            <div>
              <FormLabel>Tipo do campo</FormLabel>
              <Select 
                value={newFieldType} 
                onValueChange={(value: any) => setNewFieldType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {newFieldType === "select" && (
            <div>
              <FormLabel>Opções (separadas por vírgula)</FormLabel>
              <Input 
                value={newFieldOptions} 
                onChange={e => setNewFieldOptions(e.target.value)} 
                placeholder="Ex: Opção 1, Opção 2, Opção 3"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setAddingField(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleAddRequiredField}
            >
              Adicionar
            </Button>
          </div>
        </div>
      )}
      
      {requiredFields.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Nenhum campo obrigatório configurado
        </div>
      ) : (
        <div className="space-y-2">
          {requiredFields.map(field => (
            <div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">{field.name}</span>
                <Badge variant="outline">
                  {field.type === "text" && "Texto"}
                  {field.type === "number" && "Número"}
                  {field.type === "date" && "Data"}
                  {field.type === "checkbox" && "Checkbox"}
                  {field.type === "select" && "Seleção"}
                </Badge>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StageRequiredFields;
