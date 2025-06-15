
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduledActionAPI } from "@/services/api";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formSchema, FormValues } from "./schemas/formSchemas";
import { WebhookFields } from "./components/WebhookFields";
import { TaskFields } from "./components/TaskFields";
import { DateTimeFields } from "./components/DateTimeFields";
import { StageToggle } from "./components/StageToggle";
import { useNextStage } from "./hooks/useNextStage";
import { useDefaultDateTime } from "./hooks/useDefaultDateTime";

interface ScheduleActionFormProps {
  opportunityId: string;
  funnelId: string;
  stageId: string;
  onActionScheduled: () => void;
}

const ScheduleActionForm = ({ opportunityId, funnelId, stageId, onActionScheduled }: ScheduleActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("webhook");
  
  const nextStage = useNextStage(funnelId, stageId);
  const { formattedDate, formattedTime, todayForMin } = useDefaultDateTime();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskType: "webhook",
      url: "",
      method: "POST",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
      moveToNextStage: false,
      description: ""
    }
  });

  // Atualizar valores padrão ao trocar de tab
  useEffect(() => {
    if (activeTab === "webhook") {
      form.reset({
        taskType: "webhook",
        url: "",
        method: "POST",
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
        moveToNextStage: false,
        description: ""
      });
    } else {
      form.reset({
        taskType: "task",
        title: "",
        description: "",
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
        moveToNextStage: false,
        assignedTo: ""
      });
    }
  }, [activeTab, formattedDate, formattedTime]);

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
      
      // Reset form with fresh time defaults
      const newToday = new Date();
      newToday.setHours(newToday.getHours() + 1);
      const newFormattedDate = newToday.toISOString().split('T')[0];
      const newFormattedTime = `${String(newToday.getHours()).padStart(2, '0')}:${String(newToday.getMinutes()).padStart(2, '0')}`;
      
      if (activeTab === "webhook") {
        form.reset({
          taskType: "webhook",
          url: "",
          method: "POST",
          scheduledDate: newFormattedDate,
          scheduledTime: newFormattedTime,
          moveToNextStage: false,
          description: ""
        });
      } else {
        form.reset({
          taskType: "task",
          title: "",
          description: "",
          scheduledDate: newFormattedDate,
          scheduledTime: newFormattedTime,
          moveToNextStage: false,
          assignedTo: ""
        });
      }
    } catch (error) {
      console.error(`Erro ao agendar ${values.taskType}:`, error);
      toast.error(`Erro ao agendar ${values.taskType === "webhook" ? "webhook" : "tarefa"}. Tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="webhook">Webhook</TabsTrigger>
        <TabsTrigger value="task">Tarefa</TabsTrigger>
      </TabsList>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <input type="hidden" {...form.register("taskType")} />
          
          <TabsContent value="webhook" className="space-y-4">
            <WebhookFields control={form.control} />
          </TabsContent>
          
          <TabsContent value="task" className="space-y-4">
            <TaskFields control={form.control} />
          </TabsContent>
          
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
    </Tabs>
  );
};

export default ScheduleActionForm;
