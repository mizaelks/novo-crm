
import { Button } from "@/components/ui/button";
import { RequiredField } from "@/types";
import { Trash2, FileText, Hash, Calendar, CheckSquare, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface FieldListProps {
  fields: RequiredField[];
  onRemoveField: (id: string) => void;
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text": return <FileText className="h-3.5 w-3.5" />;
    case "number": return <Hash className="h-3.5 w-3.5" />;
    case "date": return <Calendar className="h-3.5 w-3.5" />;
    case "checkbox": return <CheckSquare className="h-3.5 w-3.5" />;
    case "select": return <List className="h-3.5 w-3.5" />;
    default: return <FileText className="h-3.5 w-3.5" />;
  }
};

const getFieldTypeLabel = (type: string) => {
  switch (type) {
    case "text": return "Texto";
    case "number": return "Número";
    case "date": return "Data";
    case "checkbox": return "Checkbox";
    case "select": return "Seleção";
    default: return "Texto";
  }
};

export const FieldList = ({ fields, onRemoveField }: FieldListProps) => {
  if (fields.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum campo obrigatório configurado</p>
            <p className="text-xs mt-1 opacity-75">
              Use os templates ou crie campos personalizados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          Campos configurados ({fields.length})
        </h4>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fields.map(field => (
          <Card key={field.id} className="transition-all hover:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-1.5 bg-primary/10 rounded-md text-primary flex-shrink-0">
                    {getFieldIcon(field.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {field.name}
                      </span>
                      {field.isRequired && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {getFieldTypeLabel(field.type)}
                      </Badge>
                      {field.type === "select" && field.options && (
                        <span className="text-xs text-muted-foreground">
                          ({field.options.length} opções)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => onRemoveField(field.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
