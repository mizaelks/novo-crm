
import { UseFormReset } from "react-hook-form";
import { FormValues } from "../schemas/formSchemas";

export const useFormReset = (
  reset: UseFormReset<FormValues>,
  formattedDate: string,
  formattedTime: string
) => {
  const resetTaskForm = () => {
    reset({
      taskType: "task",
      title: "",
      description: "",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
      moveToNextStage: false,
      assignedTo: ""
    });
  };

  const resetWebhookForm = () => {
    reset({
      taskType: "webhook",
      url: "",
      method: "POST",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
      moveToNextStage: false,
      description: ""
    });
  };

  const resetWithFreshTime = (activeTab: string) => {
    const newToday = new Date();
    newToday.setHours(newToday.getHours() + 1);
    const newFormattedDate = newToday.toISOString().split('T')[0];
    const newFormattedTime = `${String(newToday.getHours()).padStart(2, '0')}:${String(newToday.getMinutes()).padStart(2, '0')}`;
    
    if (activeTab === "webhook") {
      reset({
        taskType: "webhook",
        url: "",
        method: "POST",
        scheduledDate: newFormattedDate,
        scheduledTime: newFormattedTime,
        moveToNextStage: false,
        description: ""
      });
    } else {
      reset({
        taskType: "task",
        title: "",
        description: "",
        scheduledDate: newFormattedDate,
        scheduledTime: newFormattedTime,
        moveToNextStage: false,
        assignedTo: ""
      });
    }
  };

  return {
    resetTaskForm,
    resetWebhookForm,
    resetWithFreshTime
  };
};
