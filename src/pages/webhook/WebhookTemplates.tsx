
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookTemplate } from "@/types";
import { webhookTemplateAPI } from "@/services/api";
import WebhookTemplateForm from "@/components/webhook/WebhookTemplateForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDateTimeBRT } from "@/services/utils/dateUtils";

// Fixed import - Removed Tab which doesn't exist

const WebhookTemplates = () => {
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WebhookTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await webhookTemplateAPI.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading webhook templates:", error);
      toast.error("Erro ao carregar modelos de webhook");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreated = (template: WebhookTemplate) => {
    setTemplates([template, ...templates]);
  };

  const handleTemplateUpdated = (updated: WebhookTemplate) => {
    setTemplates(templates.map(t => (t.id === updated.id ? updated : t)));
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const success = await webhookTemplateAPI.delete(id);
      if (success) {
        setTemplates(templates.filter(t => t.id !== id));
        toast.success("Modelo excluído com sucesso");
      } else {
        toast.error("Erro ao excluir modelo");
      }
    } catch (error) {
      console.error("Error deleting webhook template:", error);
      toast.error("Erro ao excluir modelo");
    }
  };

  const copyToClipboard = (templateId: string) => {
    navigator.clipboard.writeText(templateId);
    toast.success("ID do modelo copiado para a área de transferência");
  };

  const formatEvent = (event: string) => {
    switch (event) {
      case "create": return "Criação";
      case "update": return "Atualização";
      case "move": return "Movimentação";
      default: return event;
    }
  };

  const formatTargetType = (targetType: string) => {
    switch (targetType) {
      case "funnel": return "Funil";
      case "stage": return "Etapa";
      case "opportunity": return "Oportunidade";
      default: return targetType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Modelos de Webhook</h1>
        <Link to="/webhooks">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar para Webhooks
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Modelos Disponíveis</TabsTrigger>
          <TabsTrigger value="create">Criar Novo Modelo</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Webhook Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-muted animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum modelo de webhook configurado
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description || "Sem descrição"}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded-md">
                              {formatTargetType(template.targetType)}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded-md">
                              {formatEvent(template.event)}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm break-all">
                          <div className="font-medium mb-1">URL:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground truncate">
                              {template.url}
                            </span>
                            <a
                              href={template.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="mt-2 font-medium mb-1">ID:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono">
                              {template.id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(template.id)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end justify-between">
                          <div className="text-xs text-muted-foreground">
                            Criado em {formatDateTimeBRT(template.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setIsEditDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir modelo
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este modelo de webhook?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTemplate(template.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Modelo de Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <WebhookTemplateForm onTemplateCreated={handleTemplateCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Modelo de Webhook</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <WebhookTemplateForm
              isEditing
              templateId={selectedTemplate.id}
              initialValues={{
                name: selectedTemplate.name,
                description: selectedTemplate.description,
                url: selectedTemplate.url,
                targetType: selectedTemplate.targetType,
                event: selectedTemplate.event,
                payload: selectedTemplate.payload,
              }}
              onTemplateCreated={handleTemplateUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookTemplates;
