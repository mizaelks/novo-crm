
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import type { FieldTemplate } from "@/components/customFields/CustomFieldTemplates";
import { getFieldIcon } from "../utils/icons";
import { translateFieldType, translateFieldCategory } from "../utils/translations";

interface FieldTemplateCardProps {
  template: FieldTemplate;
  onEdit: (template: FieldTemplate) => void;
  onDelete: (id: string) => void;
}

export const FieldTemplateCard = ({ template, onEdit, onDelete }: FieldTemplateCardProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-md text-primary">
          {getFieldIcon(template.type)}
        </div>
        <div>
          <p className="font-medium text-sm">{template.name}</p>
          <div className="flex gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {translateFieldType(template.type)}
            </Badge>
            {template.category && (
              <Badge variant="secondary" className="text-xs">
                {translateFieldCategory(template.category)}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(template)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(template.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
