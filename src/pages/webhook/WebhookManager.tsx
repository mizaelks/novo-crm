
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookForm from "@/components/webhook/WebhookForm";
import WebhookList from "@/components/webhook/WebhookList";
import { WebhookConfig } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Code, ChevronLeft } from "lucide-react";
import { funnelAPI, stageAPI } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WebhookHowToUse } from "./components/WebhookHowToUse";
import { EntityReferenceList } from "./components/EntityReferenceList";

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [refreshList, setRefreshList] = useState(false);
  const [funnels, setFunnels] = useState<Array<{id: string, name: string}>>([]);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciador de Webhooks</h1>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
      
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
                  
                  <EntityReferenceList funnels={funnels} stages={stages} />
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
          <WebhookHowToUse />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookManager;
