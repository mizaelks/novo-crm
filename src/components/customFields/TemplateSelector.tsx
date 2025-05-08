
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequiredField } from "@/types";
import { FIELD_TEMPLATES, FieldTemplate, templateToRequiredField } from "./CustomFieldTemplates";
import CustomFieldInfo from "./CustomFieldInfo";
import { Eye, Info, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemplateSelectorProps {
  onSelectTemplate: (field: RequiredField) => void;
  stageId: string;
}

export function TemplateSelector({ onSelectTemplate, stageId }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // Categorias dos templates
  const categories = [
    { id: 'leads', name: 'Qualificação de Leads', icon: <Tag className="w-3 h-3" /> },
    { id: 'sales', name: 'Processo de Venda', icon: <Tag className="w-3 h-3" /> },
    { id: 'all', name: 'Todos os Templates', icon: <Tag className="w-3 h-3" /> },
  ];

  // Mapeia templates para categorias - agora com categorias reais
  const templateCategories: Record<string, string[]> = {
    // Templates de qualificação de leads
    leads: ['origin', 'interest_level', 'contact_preference', 'meeting_notes'],
    // Templates do processo de vendas
    sales: ['budget', 'priority', 'decision_maker', 'next_followup', 'approved', 'deadline', 'payment_terms', 'product_interest']
  };

  // Filtrar templates por categoria selecionada
  const getTemplatesByCategory = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return FIELD_TEMPLATES;
    }

    // Filtra os templates pela categoria selecionada
    const templateIds = templateCategories[selectedCategory] || [];
    return FIELD_TEMPLATES.filter(template => templateIds.includes(template.id));
  };

  // Selecionar um template para visualização
  const handleSelectPreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  // Confirmar a adição do template
  const handleConfirmTemplate = (templateId: string) => {
    const template = FIELD_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const field = templateToRequiredField(template, stageId);
      onSelectTemplate(field);
      setPreviewTemplate(null);
    }
  };

  const filteredTemplates = getTemplatesByCategory();
  const selectedTemplateDetails = previewTemplate 
    ? FIELD_TEMPLATES.find(t => t.id === previewTemplate) 
    : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="flex items-center gap-1 flex-shrink-0"
            onClick={() => setSelectedCategory(category.id)}
            type="button" // Explicitly set button type to prevent form submission
          >
            {category.icon}
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de Templates */}
        <div className="lg:col-span-1">
          <ScrollArea className="h-64 rounded-md border">
            <div className="grid grid-cols-1 gap-1 p-2">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <Button 
                    key={template.id}
                    variant={previewTemplate === template.id ? "default" : "ghost"}
                    className="justify-start h-auto py-2 px-3 w-full"
                    onClick={() => handleSelectPreview(template.id)}
                    type="button" // Explicitly set button type to prevent form submission
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-full">
                        {template.description.substring(0, 30)}
                        {template.description.length > 30 ? '...' : ''}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center p-4 text-sm text-muted-foreground">
                  Nenhum template encontrado nesta categoria
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Detalhes do Template */}
        <div className="lg:col-span-2">
          {selectedTemplateDetails ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium">{selectedTemplateDetails.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {selectedTemplateDetails.type === "text" && "Texto"}
                      {selectedTemplateDetails.type === "number" && "Número"}
                      {selectedTemplateDetails.type === "date" && "Data"}
                      {selectedTemplateDetails.type === "checkbox" && "Checkbox"}
                      {selectedTemplateDetails.type === "select" && "Seleção"}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleConfirmTemplate(selectedTemplateDetails.id)}
                    type="button" // Explicitly set button type to prevent form submission
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">{selectedTemplateDetails.description}</p>
                
                {selectedTemplateDetails.type === "select" && selectedTemplateDetails.options && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Opções disponíveis:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplateDetails.options.map((option, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center rounded-md border p-4 text-center bg-muted/10">
              <div className="text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Selecione um template para visualizar os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
