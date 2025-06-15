
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, FileText, Hash, Calendar, CheckSquare, List } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_TASK_TEMPLATES } from "@/types/taskTemplates";
import { FIELD_TEMPLATES } from "@/components/customFields/CustomFieldTemplates";
import type { FieldTemplate } from "@/components/customFields/CustomFieldTemplates";
import type { TaskTemplate } from "@/types/taskTemplates";

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

const translateFieldType = (type: string) => {
  switch (type) {
    case "text": return "Texto";
    case "number": return "Número";
    case "date": return "Data";
    case "checkbox": return "Checkbox";
    case "select": return "Seleção";
    default: return type;
  }
};

const translateFieldCategory = (category: string) => {
  switch (category) {
    case "leads": return "Qualificação";
    case "sales": return "Vendas";
    default: return category;
  }
};

const translateTaskCategory = (category: string) => {
  switch (category) {
    case "contact": return "Contato";
    case "document": return "Documento";
    case "meeting": return "Reunião";
    case "followup": return "Follow-up";
    case "other": return "Outro";
    default: return category;
  }
};

interface TemplateManagementProps {
  isAdmin: boolean;
}

export const TemplateManagement = ({ isAdmin }: TemplateManagementProps) => {
  const [fieldTemplates, setFieldTemplates] = useState(FIELD_TEMPLATES);
  const [taskTemplates, setTaskTemplates] = useState(DEFAULT_TASK_TEMPLATES);
  const [editingFieldTemplate, setEditingFieldTemplate] = useState<FieldTemplate | null>(null);
  const [editingTaskTemplate, setEditingTaskTemplate] = useState<TaskTemplate | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </CardContent>
      </Card>
    );
  }

  const handleSaveFieldTemplate = (template: FieldTemplate) => {
    if (editingFieldTemplate) {
      setFieldTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      toast.success("Template de campo atualizado");
    } else {
      setFieldTemplates(prev => [...prev, { ...template, id: crypto.randomUUID() }]);
      toast.success("Template de campo criado");
    }
    setFieldDialogOpen(false);
    setEditingFieldTemplate(null);
  };

  const handleSaveTaskTemplate = (template: TaskTemplate) => {
    if (editingTaskTemplate) {
      setTaskTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      toast.success("Template de tarefa atualizado");
    } else {
      setTaskTemplates(prev => [...prev, { ...template, id: crypto.randomUUID() }]);
      toast.success("Template de tarefa criado");
    }
    setTaskDialogOpen(false);
    setEditingTaskTemplate(null);
  };

  const handleDeleteFieldTemplate = (id: string) => {
    setFieldTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template de campo removido");
  };

  const handleDeleteTaskTemplate = (id: string) => {
    setTaskTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template de tarefa removido");
  };

  return (
    <div className="space-y-6">
      {/* Templates de Campos Personalizados */}
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

      {/* Templates de Tarefas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Templates de Tarefas</CardTitle>
            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingTaskTemplate(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTaskTemplate ? "Editar" : "Criar"} Template de Tarefa
                  </DialogTitle>
                </DialogHeader>
                <TaskTemplateForm
                  template={editingTaskTemplate}
                  onSave={handleSaveTaskTemplate}
                  onCancel={() => {
                    setTaskDialogOpen(false);
                    setEditingTaskTemplate(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {taskTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{template.name}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {template.defaultDuration}h
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {translateTaskCategory(template.category)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTaskTemplate(template);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTaskTemplate(template.id)}
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
    </div>
  );
};

interface FieldTemplateFormProps {
  template: FieldTemplate | null;
  onSave: (template: FieldTemplate) => void;
  onCancel: () => void;
}

const FieldTemplateForm = ({ template, onSave, onCancel }: FieldTemplateFormProps) => {
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

interface TaskTemplateFormProps {
  template: TaskTemplate | null;
  onSave: (template: TaskTemplate) => void;
  onCancel: () => void;
}

const TaskTemplateForm = ({ template, onSave, onCancel }: TaskTemplateFormProps) => {
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
