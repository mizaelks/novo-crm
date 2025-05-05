
import { Badge } from "@/components/ui/badge";
import { RequiredField } from "@/types";
import { CircleDot, CircleAlert, Calendar, CheckSquare, ListChecks, Tag } from "lucide-react";

interface CustomFieldInfoProps {
  field: RequiredField;
}

const CustomFieldInfo = ({ field }: CustomFieldInfoProps) => {
  const getFieldIcon = () => {
    switch (field.type) {
      case 'text':
        return <Tag className="w-3 h-3" />;
      case 'number':
        return <CircleAlert className="w-3 h-3" />;
      case 'date':
        return <Calendar className="w-3 h-3" />;
      case 'checkbox':
        return <CheckSquare className="w-3 h-3" />;
      case 'select':
        return <ListChecks className="w-3 h-3" />;
      default:
        return <CircleDot className="w-3 h-3" />;
    }
  };

  const getFieldTypeName = () => {
    switch (field.type) {
      case 'text':
        return 'Texto';
      case 'number':
        return 'Número';
      case 'date':
        return 'Data';
      case 'checkbox':
        return 'Checkbox';
      case 'select':
        return 'Seleção';
      default:
        return field.type;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{field.name}</span>
      <Badge variant="outline" className="flex items-center gap-1">
        {getFieldIcon()}
        <span>{getFieldTypeName()}</span>
      </Badge>
      {field.isRequired && (
        <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
      )}
    </div>
  );
};

export default CustomFieldInfo;
