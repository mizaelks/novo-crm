
import { useState, useEffect } from "react";
import { WebhookConfig } from "@/types";
import { webhookAPI } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

const WebhookList = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWebhooks = async () => {
      try {
        const data = await webhookAPI.getAll();
        setWebhooks(data);
      } catch (error) {
        console.error("Error loading webhooks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWebhooks();
  }, []);

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
    return <div className="animate-pulse bg-muted h-40 rounded-md" />;
  }

  if (webhooks.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-md">
        <p className="text-muted-foreground">Nenhum webhook configurado</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de Alvo</TableHead>
          <TableHead>ID do Alvo</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {webhooks.map((webhook) => (
          <TableRow key={webhook.id}>
            <TableCell>{formatTargetType(webhook.targetType)}</TableCell>
            <TableCell>{webhook.targetId}</TableCell>
            <TableCell>{formatEvent(webhook.event)}</TableCell>
            <TableCell className="font-mono text-xs break-all">
              {webhook.url}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(webhook.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WebhookList;
