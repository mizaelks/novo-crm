
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredTask } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCreationFormProps {
  onAddTask: (task: RequiredTask) => void;
  onCancel: () => void;
  stageId: string;
}

export const TaskCreationForm = ({
  onAddTask,
  onCancel,
  stageId
}: TaskCreationFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultDuration, setDefaultDuration] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const newTask: RequiredTask = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: name.trim(),
      description: description.trim() || undefined,
      defaultDuration,
      isRequired: true,
      stageId
    };

    onAddTask(newTask);
    
    // Reset form
    setName("");
    setDescription("");
    setDefaultDuration(1);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-name">Nome da tarefa</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ligar para cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="task-description">Descrição (opcional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que deve ser feito nesta tarefa"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="task-duration">Duração padrão (horas)</Label>
            <Input
              id="task-duration"
              type="number"
              min="1"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 1)}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Adicionar tarefa
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
