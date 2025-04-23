
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info, Code, ChevronLeft, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "../../utils/constants";

const ApiDocs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documentação da API</h1>
        <div className="flex gap-3">
          <Link to="/api/tokens">
            <Button variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Gerenciar Tokens
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Esta documentação descreve os endpoints disponíveis para integração com o sistema SalesFunnel.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="funnels">Funis</TabsTrigger>
          <TabsTrigger value="stages">Etapas</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral da API</CardTitle>
              <CardDescription>
                A API do SalesFunnel permite que você integre seu sistema com nossa plataforma de gestão de vendas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Autenticação</h3>
                <p className="text-muted-foreground">
                  Todas as requisições à API devem incluir um token de autenticação no cabeçalho <code>Authorization</code>.
                  Você pode criar um token de API na página <Link to="/api/tokens" className="text-primary underline">Gerenciar Tokens</Link>.
                </p>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                  Authorization: Bearer seu_token_aqui
                </pre>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">URL Base</h3>
                <p className="text-muted-foreground">
                  Todas as URLs da API são relativas à seguinte URL base:
                </p>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                  {`${BASE_URL}/api`}
                </pre>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Formato das Respostas</h3>
                <p className="text-muted-foreground">
                  Todas as respostas são retornadas no formato JSON com os seguintes campos padrão:
                </p>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true|false,
  "data": { ... },  // Os dados solicitados (apenas quando success=true)
  "error": { ... }  // Informações de erro (apenas quando success=false)
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funnels">
          <Card>
            <CardHeader>
              <CardTitle>API de Funis</CardTitle>
              <CardDescription>
                Endpoints para gerenciar funis de vendas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Listar Funis</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">GET</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/funnels</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Pipeline de Vendas",
      "description": "Pipeline principal de vendas",
      "order": 1,
      "stages": [...]
    },
    ...
  ]
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Obter Funil por ID</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">GET</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/funnels/:id</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Pipeline de Vendas",
    "description": "Pipeline principal de vendas",
    "order": 1,
    "stages": [...]
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Criar Funil</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">POST</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/funnels</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "name": "Novo Funil",
  "description": "Descrição do novo funil"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Novo Funil",
    "description": "Descrição do novo funil",
    "order": 1,
    "stages": []
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <CardTitle>API de Etapas</CardTitle>
              <CardDescription>
                Endpoints para gerenciar etapas de funis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Listar Etapas por Funil</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">GET</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/funnels/:funnelId/stages</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Qualificação",
      "description": "Etapa de qualificação de leads",
      "order": 1,
      "funnelId": "456e4567-e89b-12d3-a456-426614174000",
      "opportunities": [...]
    },
    ...
  ]
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Criar Etapa</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">POST</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/stages</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "name": "Nova Etapa",
  "description": "Descrição da nova etapa",
  "funnelId": "456e4567-e89b-12d3-a456-426614174000"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nova Etapa",
    "description": "Descrição da nova etapa",
    "order": 1,
    "funnelId": "456e4567-e89b-12d3-a456-426614174000",
    "opportunities": []
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>API de Oportunidades</CardTitle>
              <CardDescription>
                Endpoints para gerenciar oportunidades de negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Listar Oportunidades</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">GET</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/opportunities</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Oportunidade de Venda",
      "value": 10000,
      "client": "Cliente ACME",
      "company": "ACME Inc.",
      "phone": "(21) 98765-4321",
      "email": "contato@acme.com",
      "createdAt": "2023-04-15T10:30:00Z",
      "stageId": "456e4567-e89b-12d3-a456-426614174000",
      "funnelId": "789e4567-e89b-12d3-a456-426614174000"
    },
    ...
  ]
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Criar Oportunidade</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">POST</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/opportunities</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "title": "Nova Oportunidade",
  "value": 5000,
  "client": "Novo Cliente",
  "company": "Empresa do Cliente",
  "phone": "(11) 98765-4321",
  "email": "cliente@empresa.com",
  "stageId": "456e4567-e89b-12d3-a456-426614174000",
  "funnelId": "789e4567-e89b-12d3-a456-426614174000"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Nova Oportunidade",
    "value": 5000,
    "client": "Novo Cliente",
    "company": "Empresa do Cliente",
    "phone": "(11) 98765-4321",
    "email": "cliente@empresa.com",
    "createdAt": "2023-04-15T10:30:00Z",
    "stageId": "456e4567-e89b-12d3-a456-426614174000",
    "funnelId": "789e4567-e89b-12d3-a456-426614174000"
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Atualizar Oportunidade</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">PATCH</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/opportunities/:id</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "title": "Título Atualizado",
  "value": 8000,
  "client": "Cliente Atualizado",
  "company": "Nova Empresa",
  "phone": "(11) 91234-5678",
  "email": "novo@email.com"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Título Atualizado",
    "value": 8000,
    "client": "Cliente Atualizado",
    "company": "Nova Empresa",
    "phone": "(11) 91234-5678",
    "email": "novo@email.com",
    "createdAt": "2023-04-15T10:30:00Z",
    "stageId": "456e4567-e89b-12d3-a456-426614174000",
    "funnelId": "789e4567-e89b-12d3-a456-426614174000"
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Mover Oportunidade</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">PATCH</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/opportunities/:id/move</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "stageId": "789e4567-e89b-12d3-a456-426614174000"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "stageId": "789e4567-e89b-12d3-a456-426614174000"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>API de Webhooks</CardTitle>
              <CardDescription>
                Endpoints para webhooks de entrada e saída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Webhooks de Entrada</h3>
                  <p className="text-muted-foreground">
                    Endpoint para receber webhooks e criar oportunidades automaticamente
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">POST</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/webhooks/inbound</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "title": "Nova Oportunidade via Webhook",
  "client": "Cliente Externo",
  "value": 5000,
  "company": "Empresa XYZ",
  "phone": "(11) 98765-4321",
  "email": "cliente@xyz.com",
  "stageId": "789e4567-e89b-12d3-a456-426614174000",
  "funnelId": "456e4567-e89b-12d3-a456-426614174000"
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Nova Oportunidade via Webhook",
    "client": "Cliente Externo",
    "value": 5000
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Configurar Webhooks de Saída</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Método</p>
                      <pre className="bg-muted p-2 rounded-md">POST</pre>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint</p>
                      <pre className="bg-muted p-2 rounded-md">/webhooks</pre>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Body</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "targetType": "funnel", // funnel, stage ou opportunity
  "targetId": "456e4567-e89b-12d3-a456-426614174000",
  "url": "https://seu-sistema.com/webhook",
  "event": "create" // create, update ou move
}`}
                    </pre>
                  </div>
                  
                  <div className="mt-2">
                    <p className="font-medium">Resposta</p>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "targetType": "funnel",
    "targetId": "456e4567-e89b-12d3-a456-426614174000",
    "url": "https://seu-sistema.com/webhook",
    "event": "create"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocs;
