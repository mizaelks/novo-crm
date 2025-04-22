
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookForm from "@/components/webhook/WebhookForm";
import WebhookList from "@/components/webhook/WebhookList";
import { WebhookConfig } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Code } from "lucide-react";
import { funnelAPI, stageAPI } from "@/services/api";

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [refreshList, setRefreshList] = useState(false);
  const [funnels, setFunnels] = useState<Array<{id: string, name: string}>>([]);
  // Update the type definition to include funnelId
  const [stages, setStages] = useState<Array<{id: string, name: string, funnelId: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntities = async () => {
      try {
        setLoading(true);
        const fetchedFunnels = await funnelAPI.getAll();
        setFunnels(fetchedFunnels.map(f => ({ id: f.id, name: f.name })));
        
        let allStages: Array<{id: string, name: string, funnelId: string}> = [];
        for (const funnel of fetchedFunnels) {
          const fetchedStages = await stageAPI.getByFunnelId(funnel.id);
          allStages = [...allStages, ...fetchedStages.map(s => ({ 
            id: s.id, 
            name: s.name,
            funnelId: funnel.id
          }))];
        }
        
        setStages(allStages);
      } catch (error) {
        console.error("Error loading entities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntities();
  }, []);

  const handleWebhookCreated = (webhook: WebhookConfig) => {
    setWebhooks([...webhooks, webhook]);
    setRefreshList(!refreshList);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciador de Webhooks</h1>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Webhooks permitem integrar seu pipeline com sistemas externos, notificando automaticamente quando eventos ocorrem.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="configure">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configurar Webhook</TabsTrigger>
          <TabsTrigger value="list">Webhooks Configurados</TabsTrigger>
          <TabsTrigger value="docs">Como Usar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Novo Webhook</CardTitle>
              <CardDescription>Configure webhooks para notificar sistemas externos quando eventos ocorrerem no pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookForm onWebhookCreated={handleWebhookCreated} />
              
              {!loading && (
                <div className="mt-8 space-y-4">
                  <Separator />
                  <h3 className="text-lg font-medium">IDs Disponíveis para Referência</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Funis:</h4>
                      <ul className="space-y-1 text-sm">
                        {funnels.map(funnel => (
                          <li key={funnel.id} className="grid grid-cols-2">
                            <span className="font-mono">{funnel.id}</span>
                            <span>{funnel.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Etapas:</h4>
                      <ul className="space-y-1 text-sm">
                        {stages.map(stage => (
                          <li key={stage.id} className="grid grid-cols-3">
                            <span className="font-mono">{stage.id}</span>
                            <span>{stage.name}</span>
                            <span className="text-muted-foreground text-xs">Funil: {
                              funnels.find(f => f.id === stage.funnelId)?.name || stage.funnelId
                            }</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Configurados</CardTitle>
              <CardDescription>Lista de todos os webhooks configurados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookList key={refreshList ? "refresh" : "normal"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Como Usar Webhooks</CardTitle>
              <CardDescription>Guia passo a passo para configurar e usar webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Passo a Passo para Configurar Webhooks</h3>
                </div>
                
                <ol className="list-decimal pl-6 space-y-4">
                  <li>
                    <p className="font-medium">Identifique o recurso que deseja monitorar</p>
                    <p className="text-muted-foreground">
                      Escolha entre Funil, Etapa ou Oportunidade. Cada tipo tem eventos diferentes que podem ser monitorados.
                    </p>
                  </li>
                  
                  <li>
                    <p className="font-medium">Obtenha o ID do recurso</p>
                    <p className="text-muted-foreground">
                      Use os IDs listados na aba "Configurar Webhook" ou copie o ID da URL ao navegar pelos recursos.
                    </p>
                  </li>
                  
                  <li>
                    <p className="font-medium">Configure o endpoint do seu servidor</p>
                    <p className="text-muted-foreground">
                      Crie um endpoint em seu sistema que possa receber e processar requisições POST.
                    </p>
                  </li>
                  
                  <li>
                    <p className="font-medium">Escolha o evento que deseja monitorar</p>
                    <ul className="list-disc pl-6">
                      <li><span className="font-mono">create</span> - Quando um novo item é criado</li>
                      <li><span className="font-mono">update</span> - Quando um item é atualizado</li>
                      <li><span className="font-mono">move</span> - Quando uma oportunidade muda de etapa</li>
                    </ul>
                  </li>
                  
                  <li>
                    <p className="font-medium">Configure o webhook no sistema</p>
                    <p className="text-muted-foreground">
                      Use o formulário na aba "Configurar Webhook" para adicionar o webhook ao sistema.
                    </p>
                  </li>
                </ol>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Formato do Payload</h3>
                </div>
                
                <p className="text-muted-foreground">O sistema enviará um payload JSON com a seguinte estrutura:</p>
                
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "event": "opportunity.create",  // Tipo do evento (recurso.ação)
  "data": {
    // Dados do recurso afetado
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Nova Oportunidade",
    "value": 5000,
    "client": "Cliente Exemplo",
    "stageId": "789e4567-e89b-12d3-a456-426614174000",
    "funnelId": "456e4567-e89b-12d3-a456-426614174000"
  }
}`}
                </pre>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Webhooks de Entrada</h3>
                </div>
                
                <p className="text-muted-foreground">
                  Para receber webhooks e criar oportunidades automaticamente, use o seguinte endpoint:
                </p>
                
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  POST /api/webhooks/inbound
                </div>
                
                <p className="text-muted-foreground">Envie um payload com a seguinte estrutura:</p>
                
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "title": "Nova Oportunidade via Webhook", 
  "client": "Cliente Externo",
  "value": 5000,
  "stageId": "789e4567-e89b-12d3-a456-426614174000",  // ID da etapa onde a oportunidade será criada
  "funnelId": "456e4567-e89b-12d3-a456-426614174000"  // ID do funil associado
}`}
                </pre>
              </div>
                
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4" />
                <AlertTitle>Dica de Verificação</AlertTitle>
                <AlertDescription>
                  Para testar seus webhooks, você pode usar serviços como <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">webhook.site</a> ou <a href="https://requestbin.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RequestBin</a> que fornecem URLs temporárias para receber e visualizar as chamadas de webhook.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookManager;
