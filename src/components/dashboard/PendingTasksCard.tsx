
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Calendar } from "lucide-react";
import { scheduledActionAPI } from "@/services/scheduledActionAPI";
import { ScheduledAction } from "@/types";
import { formatCurrency } from "@/services/utils/dateUtils";
import { toast } from "sonner";

interface PendingTasksCardProps {
  className?: string;
}

const PendingTasksCard = ({ className }: PendingTasksCardProps) => {
  const [pendingTasks, setPendingTasks] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPendingTasks = async () => {
      try {
        const allTasks = await scheduledActionAPI.getAll();
        const pending = allTasks.filter(task => 
          task.status === 'pending' && 
          task.actionType === 'task' &&
          new Date(task.scheduledDateTime) <= new Date()
        );
        setPendingTasks(pending.slice(0, 5)); // Mostrar apenas 5 tarefas
      } catch (error) {
        console.error("Erro ao carregar tarefas pendentes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingTasks();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await scheduledActionAPI.execute(taskId);
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Tarefa marcada como concluída");
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
      toast.error("Erro ao completar tarefa");
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tarefas Pendentes ({pendingTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma tarefa pendente!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{task.actionConfig.title || 'Tarefa sem título'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.scheduledDateTime).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-600">
                    Pendente
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    Concluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingTasksCard;
