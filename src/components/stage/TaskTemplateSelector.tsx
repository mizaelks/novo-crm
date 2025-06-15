
import { Button } from "@/components/ui/button";
import { RequiredTask } from "@/types";
import { DEFAULT_TASK_TEMPLATES } from "@/types/taskTemplates";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, MessageCircle, Mail, FileText, Calendar } from "lucide-react";
import { translateTaskCategory } from "@/components/settings/templateManagement/utils/translations";

interface TaskTemplateSelectorProps {
  requiredTasks: RequiredTask[];
  setRequiredTasks: (tasks: RequiredTask[]) => void;
  stageId: string;
}

const iconMap = {
  phone: Phone,
  'message-circle': MessageCircle,
  mail: Mail,
  'file-text': FileText,
  calendar: Calendar,
  clock: Clock,
  folder: FileText,
  'file-check': FileText
};

export const TaskTemplateSelector = ({
  requiredTasks,
  setRequiredTasks,
  stageId
}: TaskTemplateSelectorProps) => {
  
  const handleTemplateSelect = (template: any) => {
    const existingTask = requiredTasks.find(task => task.templateId === template.id);
    if (existingTask) {
      // Remove if already exists
      setRequiredTasks(requiredTasks.filter(task => task.templateId !== template.id));
    } else {
      // Add new task based on template
      const newTask: RequiredTask = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: template.name,
        description: template.description,
        defaultDuration: template.defaultDuration,
        templateId: template.id,
        isRequired: true,
        stageId
      };
      setRequiredTasks([...requiredTasks, newTask]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Templates de tarefas</h4>
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_TASK_TEMPLATES.map((template) => {
            const isSelected = requiredTasks.some(task => task.templateId === template.id);
            const IconComponent = iconMap[template.icon as keyof typeof iconMap] || Clock;
            
            return (
              <Button
                key={template.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="justify-start gap-2 h-auto p-3"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-xs">{template.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {template.defaultDuration}h
                    <Badge variant="secondary" className="text-xs ml-1">
                      {translateTaskCategory(template.category)}
                    </Badge>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
