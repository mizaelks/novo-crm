
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WebhookConfig } from "@/types";
import { webhookAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  targetType: z.enum(["funnel", "stage", "opportunity"]),
  targetId: z.string().min(1, "ID do alvo é obrigatório"),
  url: z.string().url("URL inválida"),
  event: z.enum(["create", "update", "move"])
});

type FormValues = z.infer<typeof formSchema>;

interface WebhookFormProps {
  onWebhookCreated?: (webhook: WebhookConfig) => void;
}

const WebhookForm = ({ onWebhookCreated }: WebhookFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetType: "funnel",
      targetId: "",
      url: "",
      event: "create"
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const newWebhook = await webhookAPI.create(values);
      
      toast.success("Webhook configurado com sucesso!");
      
      if (onWebhookCreated) {
        onWebhookCreated(newWebhook);
      }
      
      form.reset();
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast.error("Erro ao configurar webhook. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="targetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de alvo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de alvo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="funnel">Funil</SelectItem>
                  <SelectItem value="stage">Etapa</SelectItem>
                  <SelectItem value="opportunity">Oportunidade</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do alvo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="event"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="move">Movimentação</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de callback</FormLabel>
              <FormControl>
                <Input placeholder="https://api.exemplo.com/webhook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Configurando..." : "Configurar webhook"}
        </Button>
      </form>
    </Form>
  );
};

export default WebhookForm;
