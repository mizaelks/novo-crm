
import { UseFormSetValue } from "react-hook-form";
import { TaskTemplate } from "@/types/taskTemplates";
import { FormValues } from "../schemas/formSchemas";

export const useTemplateHandler = (setValue: UseFormSetValue<FormValues>) => {
  const handleTemplateSelect = (template: TaskTemplate | null) => {
    if (template) {
      // Calculate new date/time based on template duration
      const now = new Date();
      now.setHours(now.getHours() + template.defaultDuration);
      const newFormattedDate = now.toISOString().split('T')[0];
      const newFormattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setValue("title", template.name);
      setValue("description", template.description);
      setValue("scheduledDate", newFormattedDate);
      setValue("scheduledTime", newFormattedTime);
    }
  };

  return { handleTemplateSelect };
};
