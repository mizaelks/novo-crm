
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/types";
import { formatCurrency } from "@/utils/constants";
import { OpportunityQuickActions } from "./OpportunityQuickActions";
import { OpportunityAlertIndicator } from "./OpportunityAlertIndicator";
import { OpportunityMigrationIndicator } from "./OpportunityMigrationIndicator";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onClick: () => void;
  onAddTask?: () => void;
  onAddField?: () => void;
  stageName?: string;
}

const OpportunityCard = ({ 
  opportunity, 
  index, 
  onClick, 
  onAddTask, 
  onAddField,
  stageName 
}: OpportunityCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when dragging
    if ((e.target as HTMLElement).closest('[data-rbd-drag-handle-draggable-id]')) {
      return;
    }
    onClick();
  };

  return (
    <Draggable 
      draggableId={opportunity.id} 
      index={index}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
          }`}
          onClick={handleClick}
        >
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                  {opportunity.title}
                </h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <OpportunityAlertIndicator opportunity={opportunity} stageName={stageName} />
                  <OpportunityMigrationIndicator opportunity={opportunity} />
                </div>
              </div>
              
              {opportunity.client && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {opportunity.client}
                </p>
              )}
              
              {opportunity.value > 0 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {formatCurrency(opportunity.value)}
                </Badge>
              )}
              
              <OpportunityQuickActions
                opportunity={opportunity}
                onAddTask={onAddTask}
                onAddField={onAddField}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
