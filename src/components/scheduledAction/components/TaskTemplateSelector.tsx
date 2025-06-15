
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { DEFAULT_TASK_TEMPLATES, TaskTemplate } from "@/types/taskTemplates";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { translateTaskCategory } from "@/components/settings/templateManagement/utils/translations";
import { getTaskIcon } from "@/components/settings/templateManagement/utils/taskIcons";
import { getColorClass } from "@/components/settings/templateManagement/utils/colors";

interface TaskTemplateSelectorProps {
  control: Control<any>;
  onTemplateSelect: (template: TaskTemplate | null) => void;
}

export const TaskTemplateSelector = ({ control, onTemplateSelect }: TaskTemplateSelectorProps) => {
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
                    {getTaskIcon(template.icon)}
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
