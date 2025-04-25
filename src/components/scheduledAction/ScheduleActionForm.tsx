
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduledActionAPI } from "@/services/api";
import { ScheduledAction } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleActionFormProps {
  opportunityId: string;
  onActionScheduled: (action: ScheduledAction) => void;
}

const ScheduleActionForm = ({ opportunityId, onActionScheduled }: ScheduleActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuração para default com data atual com 1 hora à frente
  const today = new Date();
  today.setHours(today.getHours() + 1);
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time into a single Date object
      const scheduledDateTime = new Date(`${values.scheduledDate}T${values.scheduledTime}:00`);
      
      // Create the action config based on the webhook URL
      const actionConfig = { 
        url: values.url,
        method: 'POST' // Adicionando método padrão para correção do erro
      };
      
      const newAction = await scheduledActionAPI.create({
        opportunityId,
        actionType: "webhook", // Only using webhook type now
        actionConfig,
        scheduledDateTime,
        templateId: null // Setting templateId to null explicitly since we don't use templates here
      });
      
      toast.success("Webhook agendado com sucesso!");
      onActionScheduled(newAction);
      form.reset({
        url: "",
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
      });
    } catch (error) {
      console.error("Error scheduling webhook:", error);
      toast.error("Erro ao agendar webhook. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
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
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Agendando..." : "Agendar webhook"}
        </Button>
      </form>
    </Form>
  );
};

export default ScheduleActionForm;
