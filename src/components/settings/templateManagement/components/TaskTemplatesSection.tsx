
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import type { TaskTemplate } from "@/types/taskTemplates";
import { translateTaskCategory } from "../utils/translations";
import { TaskTemplateForm } from "../forms/TaskTemplateForm";

interface TaskTemplatesSectionProps {
  taskTemplates: TaskTemplate[];
  setTaskTemplates: (templates: TaskTemplate[]) => void;
}

export const TaskTemplatesSection = ({ taskTemplates, setTaskTemplates }: TaskTemplatesSectionProps) => {
  const [editingTaskTemplate, setEditingTaskTemplate] = useState<TaskTemplate | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const handleSaveTaskTemplate = (template: TaskTemplate) => {
    if (editingTaskTemplate) {
      setTaskTemplates(taskTemplates.map(t => t.id === template.id ? template : t));
      toast.success("Template de tarefa atualizado");
    } else {
      setTaskTemplates([...taskTemplates, { ...template, id: crypto.randomUUID() }]);
      toast.success("Template de tarefa criado");
    }
    setTaskDialogOpen(false);
    setEditingTaskTemplate(null);
  };

  const handleDeleteTaskTemplate = (id: string) => {
    setTaskTemplates(taskTemplates.filter(t => t.id !== id));
    toast.success("Template de tarefa removido");
  };

  return (
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
  );
};
