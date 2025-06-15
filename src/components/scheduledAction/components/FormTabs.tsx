
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookFields } from "./WebhookFields";
import { TaskFields } from "./TaskFields";
import { TaskTemplateSelector } from "./TaskTemplateSelector";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/formSchemas";
import { TaskTemplate } from "@/types/taskTemplates";

interface FormTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  control: Control<FormValues>;
  onTemplateSelect: (template: TaskTemplate | null) => void;
}

export const FormTabs = ({ activeTab, onTabChange, control, onTemplateSelect }: FormTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="task">Tarefa</TabsTrigger>
        <TabsTrigger value="webhook">Webhook</TabsTrigger>
      </TabsList>
      
      <TabsContent value="task" className="space-y-4">
        <TaskTemplateSelector 
          control={control} 
          onTemplateSelect={onTemplateSelect}
        />
        <TaskFields control={control} />
      </TabsContent>
      
      <TabsContent value="webhook" className="space-y-4">
        <WebhookFields control={control} />
      </TabsContent>
    </Tabs>
  );
};
