
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { FieldTemplate } from "@/components/customFields/CustomFieldTemplates";

interface FieldTemplateFormProps {
  template: FieldTemplate | null;
  onSave: (template: FieldTemplate) => void;
  onCancel: () => void;
}

export const FieldTemplateForm = ({ template, onSave, onCancel }: FieldTemplateFormProps) => {
  const [formData, setFormData] = useState<Partial<FieldTemplate>>({
    name: template?.name || "",
    description: template?.description || "",
    type: template?.type || "text",
    category: template?.category || "leads",
    icon: template?.icon || "file-text",
    options: template?.options || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error("Nome e descrição são obrigatórios");
      return;
    }

    onSave({
      id: template?.id || crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      category: formData.category,
      icon: formData.icon || "file-text",
      options: formData.options
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome do template"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição do template"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="select">Seleção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leads">Qualificação</SelectItem>
              <SelectItem value="sales">Vendas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === "select" && (
        <div>
          <Label htmlFor="options">Opções (uma por linha)</Label>
          <Textarea
            id="options"
            value={formData.options?.join('\n') || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              options: e.target.value.split('\n').filter(o => o.trim()) 
            }))}
            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {template ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};
