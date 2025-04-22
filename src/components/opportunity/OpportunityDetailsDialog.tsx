
import { useState, useEffect } from "react";
import { opportunityAPI, webhookAPI } from "@/services/api";
import { Opportunity, WebhookConfig } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Send, AlertCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dispatchWebhook } from "@/services/utils/webhook";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface OpportunityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
}

// Schema for webhook form
const webhookFormSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

const OpportunityDetailsDialog = ({
  open,
  onOpenChange,
  opportunityId
}: OpportunityDetailsDialogProps) => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Form for one-time webhook
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (open && opportunityId) {
        setLoading(true);
        try {
          const oppData = await opportunityAPI.getById(opportunityId);
          setOpportunity(oppData);
          
          // Load webhooks configured for this opportunity
          const webhooksData = await webhookAPI.getByTarget('opportunity', opportunityId);
          setWebhooks(webhooksData);
        } catch (error) {
          console.error("Error loading opportunity details:", error);
          toast.error("Erro ao carregar detalhes da oportunidade");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [open, opportunityId]);

  const handleCreateWebhook = async (event: 'create' | 'update' | 'move') => {
    if (!opportunity) return;

    try {
      const newWebhook = await webhookAPI.create({
        targetType: 'opportunity',
        targetId: opportunity.id,
        url: form.getValues().url,
        event: event
      });

      setWebhooks([...webhooks, newWebhook]);
      toast.success(`Webhook para evento "${event}" configurado com sucesso!`);
      form.reset();
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast.error("Erro ao configurar webhook");
    }
  };

  const handleSendWebhook = async () => {
    if (!opportunity) return;
    
    try {
      const values = form.getValues();
      setIsSendingWebhook(true);
      
      const result = await dispatchWebhook(
        {
          event: 'opportunity.manual',
          data: {
            id: opportunity.id,
            title: opportunity.title,
            client: opportunity.client,
            value: opportunity.value,
            stageId: opportunity.stageId,
            funnelId: opportunity.funnelId,
            createdAt: opportunity.createdAt,
            sentAt: new Date().toISOString()
          }
        },
        values.url
      );
      
      if (result.success) {
        toast.success(`Webhook enviado com sucesso! Status: ${result.status}`);
      } else {
        toast.error(`Erro ao enviar webhook: ${result.error || `Status ${result.status}`}`);
      }
      
      form.reset();
    } catch (error) {
      console.error("Error sending webhook:", error);
      toast.error("Erro ao enviar webhook");
    } finally {
      setIsSendingWebhook(false);
    }
  };
  
  const handleDeleteWebhook = async (id: string) => {
    try {
      const success = await webhookAPI.delete(id);
      if (success) {
        setWebhooks(webhooks.filter(webhook => webhook.id !== id));
        toast.success("Webhook removido com sucesso!");
      } else {
        toast.error("Erro ao remover webhook");
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erro ao remover webhook");
    }
  };
  
  if (loading || !opportunity) {
    return null;
  }
  
  const formattedValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(opportunity.value);
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(opportunity.createdAt));

  const formatEvent = (event: string) => {
    switch (event) {
      case "create": return "Criação";
      case "update": return "Atualização";
      case "move": return "Movimentação";
      default: return event;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{opportunity.title}</DialogTitle>
          <DialogDescription>Detalhes da oportunidade</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{opportunity.client}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-medium text-primary">{formattedValue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Data de criação
              </p>
              <p className="text-sm">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID da Oportunidade</p>
              <p className="text-xs font-mono">{opportunity.id}</p>
            </div>
          </div>
          
          <Tabs defaultValue="webhooks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="webhooks">Webhooks Configurados</TabsTrigger>
              <TabsTrigger value="send">Enviar Webhook</TabsTrigger>
            </TabsList>
            
            <TabsContent value="webhooks" className="space-y-4">
              {webhooks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum webhook configurado para esta oportunidade</p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {webhooks.map(webhook => (
                    <div 
                      key={webhook.id} 
                      className="p-3 border rounded-md bg-white flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{formatEvent(webhook.event)}</Badge>
                          <span className="text-xs text-muted-foreground">{webhook.id}</span>
                        </div>
                        <div className="mt-1 text-xs font-mono break-all">
                          {webhook.url}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="h-8 w-8 p-0"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="send">
              <Form {...form}>
                <form className="space-y-4">
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
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={handleSendWebhook}
                      className="w-full"
                      disabled={isSendingWebhook || !form.formState.isValid}
                    >
                      {isSendingWebhook ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar único
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCreateWebhook('update')}
                      className="w-full"
                      disabled={isSendingWebhook || !form.formState.isValid}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Configurar permanente
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-4 p-3 bg-muted/40 rounded-md text-sm">
                <p className="text-muted-foreground">
                  ℹ️ Use "Enviar único" para disparar o webhook uma única vez, ou "Configurar permanente" 
                  para registrar um webhook que será acionado sempre que esta oportunidade for atualizada.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDetailsDialog;
