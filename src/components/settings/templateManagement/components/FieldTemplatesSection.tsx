
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FieldTemplate } from "@/components/customFields/CustomFieldTemplates";
import { getFieldIcon } from "../utils/icons";
import { translateFieldType, translateFieldCategory } from "../utils/translations";
import { FieldTemplateForm } from "../forms/FieldTemplateForm";

interface FieldTemplatesSectionProps {
  fieldTemplates: FieldTemplate[];
  setFieldTemplates: (templates: FieldTemplate[]) => void;
}

export const FieldTemplatesSection = ({ fieldTemplates, setFieldTemplates }: FieldTemplatesSectionProps) => {
  const [editingFieldTemplate, setEditingFieldTemplate] = useState<FieldTemplate | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);

  const handleSaveFieldTemplate = (template: FieldTemplate) => {
    if (editingFieldTemplate) {
      setFieldTemplates(fieldTemplates.map(t => t.id === template.id ? template : t));
      toast.success("Template de campo atualizado");
    } else {
      setFieldTemplates([...fieldTemplates, { ...template, id: crypto.randomUUID() }]);
      toast.success("Template de campo criado");
    }
    setFieldDialogOpen(false);
    setEditingFieldTemplate(null);
  };

  const handleDeleteFieldTemplate = (id: string) => {
    setFieldTemplates(fieldTemplates.filter(t => t.id !== id));
    toast.success("Template de campo removido");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Templates de Campos Personalizados</CardTitle>
          <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingFieldTemplate(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFieldTemplate ? "Editar" : "Criar"} Template de Campo
                </DialogTitle>
              </DialogHeader>
              <FieldTemplateForm
                template={editingFieldTemplate}
                onSave={handleSaveFieldTemplate}
                onCancel={() => {
                  setFieldDialogOpen(false);
                  setEditingFieldTemplate(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fieldTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  {getFieldIcon(template.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{template.name}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {translateFieldType(template.type)}
                    </Badge>
                    {template.category && (
                      <Badge variant="secondary" className="text-xs">
                        {translateFieldCategory(template.category)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingFieldTemplate(template);
                    setFieldDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteFieldTemplate(template.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
