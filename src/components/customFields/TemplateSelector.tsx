
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequiredField } from "@/types";
import { FIELD_TEMPLATES, FieldTemplate, templateToRequiredField } from "./CustomFieldTemplates";
import { Eye, Plus, Tag, FileText, Hash, Calendar, CheckSquare, List } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TemplateSelectorProps {
  onSelectTemplate: (field: RequiredField) => void;
  stageId: string;
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text": return <FileText className="h-4 w-4" />;
    case "number": return <Hash className="h-4 w-4" />;
    case "date": return <Calendar className="h-4 w-4" />;
    case "checkbox": return <CheckSquare className="h-4 w-4" />;
    case "select": return <List className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getFieldTypeLabel = (type: string) => {
  switch (type) {
    case "text": return "Texto";
    case "number": return "Número";
    case "date": return "Data";
    case "checkbox": return "Checkbox";
    case "select": return "Seleção";
    default: return "Texto";
  }
};

export function TemplateSelector({ onSelectTemplate, stageId }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Todos', count: FIELD_TEMPLATES.length },
    { id: 'leads', name: 'Qualificação', count: FIELD_TEMPLATES.filter(t => t.category === 'leads').length },
    { id: 'sales', name: 'Vendas', count: FIELD_TEMPLATES.filter(t => t.category === 'sales').length },
  ];

  const getTemplatesByCategory = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return FIELD_TEMPLATES;
    }
    return FIELD_TEMPLATES.filter(template => template.category === selectedCategory);
  };

  const handleSelectPreview = (templateId: string) => {
    setPreviewTemplate(previewTemplate === templateId ? null : templateId);
  };

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Templates pré-definidos</h3>
          <p className="text-xs text-muted-foreground">
            Selecione um modelo para adicionar rapidamente
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="flex items-center gap-1.5 flex-shrink-0"
            onClick={() => setSelectedCategory(category.id)}
            type="button"
          >
            <span>{category.name}</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    previewTemplate === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectPreview(template.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-primary/10 rounded-md text-primary flex-shrink-0">
                        {getFieldIcon(template.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {template.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {template.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {getFieldTypeLabel(template.type)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum template nesta categoria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTemplateDetails ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getFieldIcon(selectedTemplateDetails.type)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {selectedTemplateDetails.name}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {getFieldTypeLabel(selectedTemplateDetails.type)}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleConfirmTemplate(selectedTemplateDetails.id)}
                    type="button"
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {selectedTemplateDetails.description}
                </p>
                
                {selectedTemplateDetails.type === "select" && selectedTemplateDetails.options && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Opções disponíveis:</p>
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
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Selecione um template para visualizar</p>
                  <p className="text-xs mt-1 opacity-75">
                    Clique em um template à esquerda para ver os detalhes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
