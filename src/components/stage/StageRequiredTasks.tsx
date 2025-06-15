
import { Button } from "@/components/ui/button";
import { RequiredTask } from "@/types";
import { PlusCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TaskTemplateSelector } from "./TaskTemplateSelector";
import { TaskCreationForm } from "./TaskCreationForm";
import { TaskList } from "./TaskList";

interface StageRequiredTasksProps {
  requiredTasks: RequiredTask[];
  setRequiredTasks: (tasks: RequiredTask[]) => void;
  stageId: string;
}

const StageRequiredTasks = ({
  requiredTasks,
  setRequiredTasks,
  stageId
}: StageRequiredTasksProps) => {
  const [addingTask, setAddingTask] = useState(false);

  const handleAddRequiredTask = (newTask: RequiredTask) => {
    setRequiredTasks([...requiredTasks, newTask]);
    setAddingTask(false);
    toast.success("Tarefa adicionada com sucesso");
  };

  const handleRemoveTask = (taskId: string) => {
    setRequiredTasks(requiredTasks.filter(task => task.id !== taskId));
    toast.success("Tarefa removida com sucesso");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Tarefas obrigatórias</h3>
            <p className="text-xs text-muted-foreground">
              Configure tarefas que devem ser criadas automaticamente nesta etapa
            </p>
          </div>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setAddingTask(true)}
          className="gap-1 flex-shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Tarefa personalizada
        </Button>
      </div>
      
      <TaskTemplateSelector
        requiredTasks={requiredTasks}
        setRequiredTasks={setRequiredTasks}
        stageId={stageId}
      />
      
      {addingTask && (
        <TaskCreationForm
          onAddTask={handleAddRequiredTask}
          onCancel={() => setAddingTask(false)}
          stageId={stageId}
        />
      )}
      
      <TaskList 
        tasks={requiredTasks}
        onRemoveTask={handleRemoveTask}
      />
    </div>
  );
};

export default StageRequiredTasks;
