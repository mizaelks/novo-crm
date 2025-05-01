
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const formSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  method: z.string().min(1, "Método é obrigatório"),
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

  // Set default date to current date + 1 hour
  const today = new Date();
  today.setHours(today.getHours() + 1);
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      method: "POST",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
    },
  });

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
      
      // Create action config with webhook details
      const actionConfig = { 
        url: values.url,
        method: values.method,
        payload: {
          scheduled: true,
          scheduledTime: scheduledDateTime.toISOString(),
          createdAt: new Date().toISOString()
        }
      };
      
      console.log("Agendando webhook:", {
        opportunityId,
        actionType: "webhook",
        actionConfig,
        scheduledDateTime: scheduledDateTime.toISOString(),
        templateId: null
      });
      
      const newAction = await scheduledActionAPI.create({
        opportunityId,
        actionType: "webhook",
        actionConfig,
        scheduledDateTime,
        templateId: null
      });
      
      toast.success("Webhook agendado com sucesso!");
      onActionScheduled(newAction);
      
      // Reset form with fresh time defaults
      const newToday = new Date();
      newToday.setHours(newToday.getHours() + 1);
      const newFormattedDate = newToday.toISOString().split('T')[0];
      const newFormattedTime = `${String(newToday.getHours()).padStart(2, '0')}:${String(newToday.getMinutes()).padStart(2, '0')}`;
      
      form.reset({
        url: "",
        method: "POST",
        scheduledDate: newFormattedDate,
        scheduledTime: newFormattedTime,
      });
    } catch (error) {
      console.error("Erro ao agendar webhook:", error);
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
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Agendando..." : "Agendar webhook"}
        </Button>
      </form>
    </Form>
  );
};

export default ScheduleActionForm;
