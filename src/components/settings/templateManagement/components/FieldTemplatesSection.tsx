
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { FieldTemplate } from "@/components/customFields/CustomFieldTemplates";
import { FieldTemplateForm } from "../forms/FieldTemplateForm";
import { FieldTemplateCard } from "./FieldTemplateCard";

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

  const handleEditFieldTemplate = (template: FieldTemplate) => {
    setEditingFieldTemplate(template);
    setFieldDialogOpen(true);
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
            <FieldTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditFieldTemplate}
              onDelete={handleDeleteFieldTemplate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
