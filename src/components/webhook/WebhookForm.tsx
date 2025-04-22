
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WebhookConfig, WebhookFormData } from "@/types";
import { webhookAPI, funnelAPI, stageAPI, opportunityAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [availableTargets, setAvailableTargets] = useState<Array<{id: string, name: string}>>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetType: "funnel",
      targetId: "",
      url: "",
      event: "create"
    }
  });

  const targetType = form.watch("targetType");
  
  // Fetch available targets based on selected type
  useEffect(() => {
    const fetchAvailableTargets = async () => {
      setLoadingTargets(true);
      try {
        let targets: Array<{id: string, name: string}> = [];
        
        switch (targetType) {
          case "funnel":
            const funnels = await funnelAPI.getAll();
            targets = funnels.map(f => ({ id: f.id, name: f.name }));
            break;
          case "stage":
            const funnels2 = await funnelAPI.getAll();
            for (const funnel of funnels2) {
              const stages = await stageAPI.getByFunnelId(funnel.id);
              targets = [
                ...targets, 
                ...stages.map(s => ({ 
                  id: s.id, 
                  name: `${s.name} (${funnel.name})`
                }))
              ];
            }
            break;
          case "opportunity":
            // For opportunities, we'll just recommend using stages instead
            break;
        }
        
        setAvailableTargets(targets);
      } catch (error) {
        console.error(`Error fetching ${targetType} targets:`, error);
      } finally {
        setLoadingTargets(false);
      }
    };
    
    fetchAvailableTargets();
  }, [targetType]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a properly typed WebhookFormData object from the form values
      const webhookData: WebhookFormData = {
        targetType: values.targetType,
        targetId: values.targetId,
        url: values.url,
        event: values.event
      };
      
      // Check if event type is valid for target type
      if (values.targetType !== 'opportunity' && values.event === 'move') {
        toast.error("O evento 'move' só é válido para oportunidades");
        return;
      }
      
      const newWebhook = await webhookAPI.create(webhookData);
      
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
              <FormDescription>
                Selecione o tipo de recurso que você deseja monitorar
              </FormDescription>
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
              {availableTargets.length > 0 ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingTargets ? "Carregando..." : "Selecione o ID"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTargets.map(target => (
                      <SelectItem key={target.id} value={target.id}>
                        {target.name} ({target.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input 
                    placeholder={loadingTargets ? "Carregando..." : "Ex: 1234-5678-9012"} 
                    {...field} 
                    disabled={loadingTargets}
                  />
                </FormControl>
              )}
              <FormDescription>
                {targetType === "opportunity" ? 
                  "Para oportunidades específicas, você pode copiar o ID da URL ao visualizar a oportunidade" :
                  "Selecione um ID da lista ou insira manualmente"}
              </FormDescription>
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
                  <SelectItem value="move" disabled={targetType !== 'opportunity'}>
                    Movimentação {targetType !== 'opportunity' && "(Apenas para oportunidades)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Escolha quando o webhook deve ser disparado
              </FormDescription>
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
              <FormDescription>
                URL para onde o sistema enviará as notificações de eventos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting || loadingTargets} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configurando...
            </>
          ) : "Configurar webhook"}
        </Button>
      </form>
    </Form>
  );
};

export default WebhookForm;
