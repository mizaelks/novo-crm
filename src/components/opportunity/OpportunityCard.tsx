
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
}

const OpportunityCard = ({ opportunity, index }: OpportunityCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const formattedValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(opportunity.value);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(new Date(opportunity.createdAt));

  // Check if there are any pending scheduled actions
  const hasScheduledActions = opportunity.scheduledActions?.some(
    action => action.status === 'pending'
  );

  return (
    <>
      <Draggable draggableId={opportunity.id} index={index}>
        {(provided, snapshot) => (
          <Card 
            className={`mb-2 hover:shadow-md transition-all ${
              snapshot.isDragging ? "shadow-lg dragging" : ""
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsDetailsOpen(true)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{opportunity.title}</h3>
                  <span className="text-primary font-semibold text-sm">
                    {formattedValue}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cliente: {opportunity.client}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formattedDate}
                  </div>
                  {hasScheduledActions && (
                    <div className="flex items-center text-xs text-secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Ação agendada
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      <OpportunityDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        opportunityId={opportunity.id}
      />
    </>
  );
};

export default OpportunityCard;
