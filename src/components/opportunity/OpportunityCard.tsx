
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Eye, Edit, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { OpportunityMigrationIndicator } from "./OpportunityMigrationIndicator";
import { OpportunityMultipleAlerts } from "./OpportunityMultipleAlerts";
import { OpportunityQuickActions } from "./OpportunityQuickActions";
import { usePendingTasks } from "@/hooks/usePendingTasks";
import { toast } from "sonner";

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
  const { pendingTasks, completeTask } = usePendingTasks(opportunity.id);
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
    if (onAddTask) {
      onAddTask(opportunity);
    }
  };

  const handleAddField = () => {
    if (onAddField) {
      onAddField(opportunity);
    }
  };

  return (
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
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {opportunity.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{opportunity.client}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <Badge variant="outline" className="text-xs px-2 py-0" style={{ borderColor: stage.color }}>
                    {formatCurrency(opportunity.value)}
                  </Badge>
                  <OpportunityMigrationIndicator opportunity={opportunity} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(opportunity.createdAt, "dd/MM")}</span>
                </div>
                
                {/* Botão de concluir tarefa na primeira visão */}
                {firstPendingTask && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={handleCompleteTask}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluir
                  </Button>
                )}
              </div>

              {/* Alertas múltiplos */}
              <OpportunityMultipleAlerts 
                opportunity={opportunity}
                stage={stage}
                pendingTasks={pendingTasks}
              />
              
              {opportunity.company && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{opportunity.company}</p>
                </div>
              )}
            </CardContent>

            {/* Ações rápidas no rodapé */}
            <OpportunityQuickActions
              opportunity={opportunity}
              onAddTask={handleAddTask}
              onAddField={handleAddField}
            />
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
