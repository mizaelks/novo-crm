
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
import { usePendingTasks } from "@/hooks/usePendingTasks";
import { toast } from "sonner";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  stage: Stage;
  onClick?: (opportunity: Opportunity) => void;
}

const OpportunityCard = ({ 
  opportunity, 
  index, 
  stage,
  onClick
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

  const handleCompleteTask = async () => {
    if (!firstPendingTask) return;
    
    const success = await completeTask(firstPendingTask.id);
    if (success) {
      toast.success("Tarefa concluída com sucesso!");
    } else {
      toast.error("Erro ao concluir tarefa");
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
            
            <CardContent className="pt-0 pb-3 px-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(opportunity.createdAt, "dd/MM")}</span>
                </div>
              </div>

              {/* Alertas múltiplos com botão de concluir integrado */}
              <OpportunityMultipleAlerts 
                opportunity={opportunity}
                stage={stage}
                pendingTasks={pendingTasks}
                onCompleteTask={firstPendingTask ? handleCompleteTask : undefined}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
