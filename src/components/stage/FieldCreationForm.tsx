
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequiredField } from "@/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface FieldCreationFormProps {
  onAddField: (field: RequiredField) => void;
  onCancel: () => void;
  stageId: string;
}

export const FieldCreationForm = ({
  onAddField,
  onCancel,
  stageId
}: FieldCreationFormProps) => {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "date" | "checkbox" | "select">("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  const handleAddField = () => {
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

    onAddField(newField);
    
    // Reset form
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Novo campo personalizado</h3>
      <Separator className="my-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FormLabel className="mb-1 block">Nome do campo</FormLabel>
          <Input 
            value={newFieldName} 
            onChange={e => setNewFieldName(e.target.value)} 
            placeholder="Ex: Valor da proposta"
          />
        </div>
        <div>
          <FormLabel className="mb-1 block">Tipo do campo</FormLabel>
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
          <FormLabel className="mb-1 block">Opções (separadas por vírgula)</FormLabel>
          <Input 
            value={newFieldOptions} 
            onChange={e => setNewFieldOptions(e.target.value)} 
            placeholder="Ex: Opção 1, Opção 2, Opção 3"
          />
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          size="sm"
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleAddField}
          size="sm"
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
};
