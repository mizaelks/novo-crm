
import { useState } from "react";
import { scheduledActionAPI } from "@/services/api";
import { toast } from "sonner";
import { FormValues } from "../schemas/formSchemas";
import { Stage } from "@/types";

export const useFormSubmission = (
  opportunityId: string,
  nextStage: Stage | null,
  onActionScheduled: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time into a single Date object
      const scheduledDateTime = new Date(`${values.scheduledDate}T${values.scheduledTime}:00`);
      
      // Verify the date is not in the past (allow same day but check if time has passed)
      const now = new Date();
      
      // Only prevent if the scheduled time is in the past
      if (scheduledDateTime < now) {
        toast.error("A data e hora agendada não pode ser no passado");
        setIsSubmitting(false);
        return;
      }

      let actionConfig: any = {
        moveToNextStage: values.moveToNextStage,
        nextStageId: values.moveToNextStage && nextStage ? nextStage.id : null,
      };
      
      // Configuração específica baseada no tipo de tarefa
      if (values.taskType === "webhook") {
        actionConfig = {
          ...actionConfig,
          url: values.url,
          method: values.method,
          description: values.description || "Webhook agendado",
          payload: {
            scheduled: true,
            scheduledTime: scheduledDateTime.toISOString(),
            createdAt: new Date().toISOString()
          }
        };
      } else {
        actionConfig = {
          ...actionConfig,
          title: values.title,
          description: values.description || "",
          assignedTo: values.assignedTo || null,
        };
      }
      
      console.log(`Agendando ${values.taskType}:`, {
        opportunityId,
        actionType: values.taskType,
        actionConfig,
        scheduledDateTime: scheduledDateTime.toISOString()
      });
      
      const newAction = await scheduledActionAPI.create({
        opportunityId,
        actionType: values.taskType,
        actionConfig,
        scheduledDateTime,
        templateId: null
      });
      
      toast.success(`${values.taskType === "webhook" ? "Webhook" : "Tarefa"} agendado com sucesso!`);
      onActionScheduled();
      
      return true; // Success indicator
    } catch (error) {
      console.error(`Erro ao agendar ${values.taskType}:`, error);
      toast.error(`Erro ao agendar ${values.taskType === "webhook" ? "webhook" : "tarefa"}. Tente novamente.`);
      return false; // Failure indicator
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
