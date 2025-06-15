
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { TaskTemplate } from "@/types/taskTemplates";

interface TaskTemplateFormProps {
  template: TaskTemplate | null;
  onSave: (template: TaskTemplate) => void;
  onCancel: () => void;
}

export const TaskTemplateForm = ({ template, onSave, onCancel }: TaskTemplateFormProps) => {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    category: template?.category || ("contact" as const),
    defaultDuration: template?.defaultDuration || 1,
    icon: template?.icon || "clock",
    color: template?.color || "blue"
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
      category: formData.category,
      defaultDuration: formData.defaultDuration,
      icon: formData.icon,
      color: formData.color
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
          placeholder="Nome da tarefa"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição da tarefa"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              category: value as TaskTemplate['category']
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contact">Contato</SelectItem>
              <SelectItem value="document">Documento</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="followup">Follow-up</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duração (horas)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.defaultDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>

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
