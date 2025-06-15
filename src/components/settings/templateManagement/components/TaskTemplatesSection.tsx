
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { TaskTemplate } from "@/types/taskTemplates";
import { TaskTemplateForm } from "../forms/TaskTemplateForm";
import { TaskTemplateCard } from "./TaskTemplateCard";

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

  const handleEditTaskTemplate = (template: TaskTemplate) => {
    setEditingTaskTemplate(template);
    setTaskDialogOpen(true);
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
            <TaskTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTaskTemplate}
              onDelete={handleDeleteTaskTemplate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
