
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Code } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const WebhookHowToUse = () => {
  return (
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
  "company": "Empresa Cliente",
  "phone": "(11) 98765-4321",
  "email": "cliente@empresa.com",
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
  );
};
