
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduledActionAPI } from "@/services/api";
import { ScheduledAction } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { stageAPI } from "@/services/api";
import { Stage } from "@/types";

// Schema de validação para webhook
const webhookSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  method: z.string().min(1, "Método é obrigatório"),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
  moveToNextStage: z.boolean().default(false),
  description: z.string().optional(),
  taskType: z.literal("webhook")
});

// Schema de validação para tarefas
const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
  moveToNextStage: z.boolean().default(false),
  assignedTo: z.string().optional(),
  taskType: z.literal("task")
});

// União dos schemas
const formSchema = z.discriminatedUnion("taskType", [webhookSchema, taskSchema]);

type FormValues = z.infer<typeof formSchema>;

interface ScheduleActionFormProps {
  opportunityId: string;
  funnelId: string;
  stageId: string;
  onActionScheduled: (action: ScheduledAction) => void;
}

const ScheduleActionForm = ({ opportunityId, funnelId, stageId, onActionScheduled }: ScheduleActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("webhook");
  const [nextStage, setNextStage] = useState<Stage | null>(null);

  // Set default date to current date + 1 hour
  const today = new Date();
  today.setHours(today.getHours() + 1);
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  // Buscar o próximo estágio disponível
  useEffect(() => {
    const fetchNextStage = async () => {
      try {
        // Buscar todos os estágios do funil atual
        const stages = await stageAPI.getByFunnelId(funnelId);
        
        // Organizar por ordem
        const sortedStages = stages.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Encontrar o índice do estágio atual
        const currentStageIndex = sortedStages.findIndex(s => s.id === stageId);
        
        // Se não for o último estágio, definir o próximo
        if (currentStageIndex >= 0 && currentStageIndex < sortedStages.length - 1) {
          setNextStage(sortedStages[currentStageIndex + 1]);
        }
      } catch (error) {
        console.error("Erro ao buscar próximo estágio:", error);
      }
    };

    if (funnelId && stageId) {
      fetchNextStage();
    }
  }, [funnelId, stageId]);

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
      
      // Verify the date is in the future
      const now = new Date();
      if (scheduledDateTime <= now) {
        toast.error("A data e hora agendadas devem ser no futuro");
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
      onActionScheduled(newAction);
      
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
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.exemplo.com/webhook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método HTTP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do webhook..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="task" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Tarefa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ligar para o cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes da tarefa..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atribuir a (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {nextStage && (
            <FormField
              control={form.control}
              name="moveToNextStage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Mover para próxima etapa</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Ao concluir, mover para "{nextStage.name}"
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          
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
