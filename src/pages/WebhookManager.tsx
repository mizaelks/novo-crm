
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookForm from "@/components/webhook/WebhookForm";
import WebhookList from "@/components/webhook/WebhookList";
import { WebhookConfig } from "@/types";

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [refreshList, setRefreshList] = useState(false);

  const handleWebhookCreated = (webhook: WebhookConfig) => {
    setWebhooks([...webhooks, webhook]);
    setRefreshList(!refreshList);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciador de Webhooks</h1>
      
      <Tabs defaultValue="configure">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configure">Configurar Webhook</TabsTrigger>
          <TabsTrigger value="list">Webhooks Configurados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <WebhookForm onWebhookCreated={handleWebhookCreated} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              <WebhookList key={refreshList ? "refresh" : "normal"} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Webhooks de Entrada</h2>
        <Card>
          <CardHeader>
            <CardTitle>Endpoint para Receber Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Use o seguinte endpoint para receber webhooks externos e criar/atualizar oportunidades:
            </p>
            
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              POST /webhooks/inbound
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Exemplo de Payload:</h3>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`{
  "title": "Nova Oportunidade via API", 
  "client": "Empresa Externa",
  "value": 5000,
  "stageId": "1",
  "funnelId": "1"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhookManager;
