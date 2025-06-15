
import { Button } from "@/components/ui/button";
import { RequiredTask } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock } from "lucide-react";

interface TaskListProps {
  tasks: RequiredTask[];
  onRemoveTask: (taskId: string) => void;
}

export const TaskList = ({ tasks, onRemoveTask }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma tarefa obrigatória configurada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">Tarefas configuradas</h4>
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-card"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{task.name}</span>
              <Badge variant="secondary" className="text-xs">
                {task.defaultDuration}h
              </Badge>
              {task.templateId && (
                <Badge variant="outline" className="text-xs">
                  Template
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground">{task.description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveTask(task.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
