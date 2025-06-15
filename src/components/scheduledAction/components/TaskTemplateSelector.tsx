
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { DEFAULT_TASK_TEMPLATES, TaskTemplate } from "@/types/taskTemplates";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, FileText, Mail, Folder, MessageCircle, Clock, FileCheck } from "lucide-react";
import { translateTaskCategory } from "@/components/settings/templateManagement/utils/translations";

interface TaskTemplateSelectorProps {
  control: Control<any>;
  onTemplateSelect: (template: TaskTemplate | null) => void;
}

export const TaskTemplateSelector = ({ control, onTemplateSelect }: TaskTemplateSelectorProps) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'message-circle': return <MessageCircle className="h-4 w-4" />;
      case 'file-text': return <FileText className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'mail': return <Mail className="h-4 w-4" />;
      case 'folder': return <Folder className="h-4 w-4" />;
      case 'clock': return <Clock className="h-4 w-4" />;
      case 'file-check': return <FileCheck className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      gray: 'border-gray-200 bg-gray-50 text-gray-700',
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
    return colorMap[color] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  return (
    <FormField
      control={control}
      name="templateId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tarefa padrão (opcional)</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value === 'custom' ? undefined : value);
              const template = DEFAULT_TASK_TEMPLATES.find(t => t.id === value);
              onTemplateSelect(template || null);
            }}
            value={field.value || 'custom'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma tarefa padrão ou crie personalizada" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Tarefa personalizada</span>
                </div>
              </SelectItem>
              {DEFAULT_TASK_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {getIcon(template.icon)}
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">{template.description}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getColorClass(template.color)}`}
                      >
                        {template.defaultDuration}h
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {translateTaskCategory(template.category)}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};
