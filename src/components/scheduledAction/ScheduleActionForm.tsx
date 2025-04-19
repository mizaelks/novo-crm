
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduledActionAPI } from "@/services/api";
import { ScheduledAction } from "@/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  actionType: z.enum(["email", "webhook"]),
  email: z.string().email("E-mail inválido").optional(),
  subject: z.string().min(2, "Assunto é obrigatório").optional(),
  body: z.string().min(5, "Corpo do e-mail é obrigatório").optional(),
  url: z.string().url("URL inválida").optional(),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
}).superRefine((data, ctx) => {
  if (data.actionType === "email") {
    if (!data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "E-mail é obrigatório",
        path: ["email"],
      });
    }
    if (!data.subject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assunto é obrigatório",
        path: ["subject"],
      });
    }
    if (!data.body) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Corpo do e-mail é obrigatório",
        path: ["body"],
      });
    }
  } else if (data.actionType === "webhook") {
    if (!data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL é obrigatória",
        path: ["url"],
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleActionFormProps {
  opportunityId: string;
  onActionScheduled: (action: ScheduledAction) => void;
}

const ScheduleActionForm = ({ opportunityId, onActionScheduled }: ScheduleActionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actionType: "email",
      email: "",
      subject: "",
      body: "",
      url: "",
      scheduledDate: formattedDate,
      scheduledTime: formattedTime,
    },
  });

  const actionType = form.watch("actionType");

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time into a single Date object
      const scheduledDateTime = new Date(`${values.scheduledDate}T${values.scheduledTime}:00`);
      
      // Create the action config based on the action type
      const actionConfig = values.actionType === "email" 
        ? { email: values.email, subject: values.subject, body: values.body }
        : { url: values.url };
      
      const newAction = await scheduledActionAPI.create({
        opportunityId,
        actionType: values.actionType,
        actionConfig,
        scheduledDateTime,
      });
      
      toast.success("Ação agendada com sucesso!");
      onActionScheduled(newAction);
      form.reset({
        actionType: "email",
        email: "",
        subject: "",
        body: "",
        url: "",
        scheduledDate: formattedDate,
        scheduledTime: formattedTime,
      });
    } catch (error) {
      console.error("Error scheduling action:", error);
      toast.error("Erro ao agendar ação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="actionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de ação</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="email" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Enviar e-mail
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="webhook" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Executar webhook
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {actionType === "email" && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do destinatário</FormLabel>
                  <FormControl>
                    <Input placeholder="cliente@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Seguimento da proposta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Olá, gostaria de saber se você teve tempo para analisar nossa proposta..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {actionType === "webhook" && (
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
        )}
        
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
          {isSubmitting ? "Agendando..." : "Agendar ação"}
        </Button>
      </form>
    </Form>
  );
};

export default ScheduleActionForm;
