
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FieldListProps {
  fields: RequiredField[];
  onRemoveField: (id: string) => void;
}

export const FieldList = ({ fields, onRemoveField }: FieldListProps) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-md">
        Nenhum campo obrigatório configurado
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {fields.map(field => (
        <div key={field.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/5">
          <div className="flex items-center gap-2">
            <span className="font-medium">{field.name}</span>
            <Badge variant="outline" className="ml-1">
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
            className="h-8 w-8 opacity-70 hover:opacity-100"
            onClick={() => onRemoveField(field.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
