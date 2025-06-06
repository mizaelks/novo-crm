
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequiredField } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Novo campo personalizado</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Nome do campo</FormLabel>
            <Input 
              value={newFieldName} 
              onChange={e => setNewFieldName(e.target.value)} 
              placeholder="Ex: Valor da proposta"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Tipo do campo</FormLabel>
            <Select 
              value={newFieldType} 
              onValueChange={(value: any) => setNewFieldType(value)}
            >
              <SelectTrigger className="w-full">
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
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Opções (separadas por vírgula)</FormLabel>
            <Input 
              value={newFieldOptions} 
              onChange={e => setNewFieldOptions(e.target.value)} 
              placeholder="Ex: Opção 1, Opção 2, Opção 3"
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            size="sm"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleAddField}
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
