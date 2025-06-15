
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formSchema, FormValues } from "./schemas/formSchemas";
import { DateTimeFields } from "./components/DateTimeFields";
import { StageToggle } from "./components/StageToggle";
import { FormTabs } from "./components/FormTabs";
import { useNextStage } from "./hooks/useNextStage";
import { useDefaultDateTime } from "./hooks/useDefaultDateTime";
import { useFormReset } from "./hooks/useFormReset";
import { useTemplateHandler } from "./hooks/useTemplateHandler";
import { useFormSubmission } from "./hooks/useFormSubmission";

interface ScheduleActionFormProps {
  opportunityId: string;
  funnelId: string;
  stageId: string;
  onActionScheduled: () => void;
}

const ScheduleActionForm = ({ opportunityId, funnelId, stageId, onActionScheduled }: ScheduleActionFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("task");
  
  const nextStage = useNextStage(funnelId, stageId);
  const { formattedDate, formattedTime, todayForMin } = useDefaultDateTime();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskType: "task",
      title: "",
      description: "",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
      moveToNextStage: false,
      assignedTo: ""
    }
  });

  const { resetTaskForm, resetWebhookForm, resetWithFreshTime } = useFormReset(
    form.reset, 
    formattedDate, 
    formattedTime
  );

  const { handleTemplateSelect } = useTemplateHandler(form.setValue);
  const { handleSubmit: onSubmit, isSubmitting } = useFormSubmission(
    opportunityId,
    nextStage,
    onActionScheduled
  );

  // Atualizar valores padrão ao trocar de tab
  useEffect(() => {
    if (activeTab === "webhook") {
      resetWebhookForm();
    } else {
      resetTaskForm();
    }
  }, [activeTab, formattedDate, formattedTime]);

  const handleSubmit = async (values: FormValues) => {
    const success = await onSubmit(values);
    if (success) {
      resetWithFreshTime(activeTab);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <input type="hidden" {...form.register("taskType")} />
        
        <FormTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          control={form.control}
          onTemplateSelect={handleTemplateSelect}
        />
        
        <DateTimeFields control={form.control} todayForMin={todayForMin} />
        
        <StageToggle control={form.control} nextStage={nextStage} />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting 
            ? "Agendando..." 
            : `Agendar ${activeTab === "webhook" ? "webhook" : "tarefa"}`
          }
        </Button>
      </form>
    </Form>
  );
};

export default ScheduleActionForm;
