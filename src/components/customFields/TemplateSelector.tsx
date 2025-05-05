
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequiredField } from "@/types";
import { FIELD_TEMPLATES, templateToRequiredField } from "./CustomFieldTemplates";
import CustomFieldInfo from "./CustomFieldInfo";
import { Info, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemplateSelectorProps {
  onSelectTemplate: (field: RequiredField) => void;
  stageId: string;
}

export function TemplateSelector({ onSelectTemplate, stageId }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorias dos templates
  const categories = [
    { id: 'leads', name: 'Qualificação de Leads', icon: <Tag className="w-3 h-3" /> },
    { id: 'sales', name: 'Processo de Venda', icon: <Tag className="w-3 h-3" /> },
    { id: 'all', name: 'Todos os Templates', icon: <Tag className="w-3 h-3" /> },
  ];

  // Mapeia templates para categorias
  const getTemplatesByCategory = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return FIELD_TEMPLATES;
    }

    // Aqui você pode adicionar lógica para filtrar templates por categoria
    // Por enquanto vamos retornar todos já que não temos categorias reais
    return FIELD_TEMPLATES;
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = FIELD_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const field = templateToRequiredField(template, stageId);
      onSelectTemplate(field);
    }
  };

  const filteredTemplates = getTemplatesByCategory();

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="flex items-center gap-1 flex-shrink-0"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon}
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[240px] rounded-md border p-2">
        <div className="grid grid-cols-1 gap-2">
          {filteredTemplates.map((template) => {
            const tempField: RequiredField = {
              id: template.id,
              name: template.name,
              type: template.type,
              options: template.options,
              isRequired: true,
              stageId: stageId
            };

            return (
              <Card 
                key={template.id}
                className="hover:bg-accent/10 cursor-pointer"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CustomFieldInfo field={tempField} />
                    
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(template.id);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adicionar este campo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
