
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FieldListProps {
  fields: RequiredField[];
  onRemoveField: (id: string) => void;
}

export const FieldList = ({ fields, onRemoveField }: FieldListProps) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-5 text-muted-foreground bg-muted/10 rounded-md border border-dashed">
        Nenhum campo obrigatório configurado
      </div>
    );
  }
  
  return (
    <div>
      <div className="text-sm font-medium mb-2">Campos configurados</div>
      <ScrollArea className={`${fields.length > 5 ? 'max-h-[250px]' : ''} rounded-md`}>
        <div className="space-y-1 p-1">
          {fields.map(field => (
            <div key={field.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{field.name}</span>
                <Badge variant="outline" className="text-xs">
                  {field.type === "text" && "Texto"}
                  {field.type === "number" && "Número"}
                  {field.type === "date" && "Data"}
                  {field.type === "checkbox" && "Checkbox"}
                  {field.type === "select" && "Seleção"}
                </Badge>
                {field.isRequired && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-70 hover:opacity-100"
                onClick={() => onRemoveField(field.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
