
import { useState, useEffect } from "react";
import { WebhookConfig } from "@/types";
import { webhookAPI } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { dispatchWebhook } from "@/services/utils/webhook";

const WebhookList = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const data = await webhookAPI.getAll();
      setWebhooks(data);
    } catch (error) {
      console.error("Error loading webhooks:", error);
      toast.error("Erro ao carregar webhooks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await webhookAPI.delete(id);
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
      toast.success("Webhook removido com sucesso!");
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erro ao remover webhook. Tente novamente.");
    }
  };

  const handleTest = async (webhook: WebhookConfig) => {
    setTestingId(webhook.id);
    
    try {
      const testPayload = {
        event: `${webhook.targetType}.${webhook.event}`,
        data: {
          id: webhook.targetId,
          _test: true,
          timestamp: new Date().toISOString()
        }
      };
      
      const result = await dispatchWebhook(testPayload, webhook.url);
      
      if (result.success) {
        toast.success(`Webhook testado com sucesso! Status: ${result.status}`);
      } else {
        toast.error(`Erro ao testar webhook: ${result.error || `Status ${result.status}`}`);
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error("Erro ao testar webhook");
    } finally {
      setTestingId(null);
    }
  };

  const formatTargetType = (type: string) => {
    switch (type) {
      case "funnel": return "Funil";
      case "stage": return "Etapa";
      case "opportunity": return "Oportunidade";
      default: return type;
    }
  };

  const formatEvent = (event: string) => {
    switch (event) {
      case "create": return "Criação";
      case "update": return "Atualização";
      case "move": return "Movimentação";
      default: return event;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <Alert className="bg-muted/40 border-muted my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum webhook configurado</AlertTitle>
        <AlertDescription>
          Configure webhooks na aba "Configurar Webhook" para integrar com sistemas externos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>ID do Alvo</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {webhooks.map((webhook) => (
          <TableRow key={webhook.id}>
            <TableCell>
              <Badge variant="outline">
                {formatTargetType(webhook.targetType)}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {webhook.targetId}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {formatEvent(webhook.event)}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs break-all max-w-[200px]">
              {webhook.url}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTest(webhook)}
                disabled={testingId === webhook.id}
              >
                {testingId === webhook.id ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testando
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Testar
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(webhook.id)}
                disabled={testingId === webhook.id}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WebhookList;
