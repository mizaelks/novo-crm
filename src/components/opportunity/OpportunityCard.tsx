
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { OpportunityMigrationIndicator } from "./OpportunityMigrationIndicator";
import { OpportunityMultipleAlerts } from "./OpportunityMultipleAlerts";
import { OpportunityQuickActions } from "./OpportunityQuickActions";
import { AddTaskDialog } from "./AddTaskDialog";
import { AddFieldDialog } from "./AddFieldDialog";
import { usePendingTasks } from "@/hooks/usePendingTasks";
import { toast } from "sonner";
import { useState } from "react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  stage: Stage;
  onClick?: (opportunity: Opportunity) => void;
  onAddTask?: (opportunity: Opportunity) => void;
  onAddField?: (opportunity: Opportunity) => void;
}

const OpportunityCard = ({ 
  opportunity, 
  index, 
  stage,
  onClick,
  onAddTask,
  onAddField
}: OpportunityCardProps) => {
  const { pendingTasks, completeTask, refreshTasks } = usePendingTasks(opportunity.id);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const firstPendingTask = pendingTasks[0];

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening details when clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onClick) {
      onClick(opportunity);
    }
  };

  const handleCompleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstPendingTask) return;
    
    const success = await completeTask(firstPendingTask.id);
    if (success) {
      toast.success("Tarefa concluída com sucesso!");
    } else {
      toast.error("Erro ao concluir tarefa");
    }
  };

  const handleAddTask = () => {
    setTaskDialogOpen(true);
  };

  const handleAddField = () => {
    setFieldDialogOpen(true);
  };

  const handleTaskAdded = () => {
    refreshTasks();
    if (onAddTask) {
      onAddTask(opportunity);
    }
  };

  const handleFieldAdded = () => {
    if (onAddField) {
      onAddField(opportunity);
    }
  };

  return (
    <>
      <Draggable draggableId={opportunity.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${snapshot.isDragging ? 'rotate-1 scale-105' : ''}`}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 group overflow-hidden"
              onClick={handleCardClick}
            >
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors leading-tight">
                      {opportunity.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{opportunity.client}</p>
                    {opportunity.company && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{opportunity.company}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs px-2 py-0 font-medium text-right" style={{ borderColor: stage.color }}>
                      {formatCurrency(opportunity.value)}
                    </Badge>
                    <OpportunityMigrationIndicator opportunity={opportunity} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-0 px-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{format(opportunity.createdAt, "dd/MM")}</span>
                  </div>
                  
                  {/* Botão de concluir tarefa - mais compacto */}
                  {firstPendingTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={handleCompleteTask}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>

                {/* Alertas múltiplos - mais compactos */}
                <OpportunityMultipleAlerts 
                  opportunity={opportunity}
                  stage={stage}
                  pendingTasks={pendingTasks}
                />
              </CardContent>

              {/* Ações rápidas no rodapé - mais compacto */}
              <OpportunityQuickActions
                opportunity={opportunity}
                onAddTask={handleAddTask}
                onAddField={handleAddField}
              />
            </Card>
          </div>
        )}
      </Draggable>

      {/* Dialogs */}
      <AddTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        opportunity={opportunity}
        onTaskAdded={handleTaskAdded}
      />

      <AddFieldDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        opportunity={opportunity}
        onFieldAdded={handleFieldAdded}
      />
    </>
  );
};

export default OpportunityCard;
