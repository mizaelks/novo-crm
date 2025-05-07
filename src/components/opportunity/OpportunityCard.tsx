
import { Draggable } from "react-beautiful-dnd";
import { Opportunity, RequiredField } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useState } from "react";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { useKanbanDrag } from "../kanban/KanbanDragContext";
import { AlertCircle } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
  onOpportunityDeleted: (opportunityId: string) => void;
}

const OpportunityCard = ({
  opportunity,
  index,
  onOpportunityUpdated,
  onOpportunityDeleted
}: OpportunityCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { stages } = useKanbanDrag();
  
  // Check if this opportunity was created from webhook/API and is missing required fields
  const isFromWebhook = opportunity.customFields?.isFromWebhook === true;
  
  // Get current stage details
  const currentStage = stages.find(stage => stage.id === opportunity.stageId);
  const requiredFields = currentStage?.requiredFields?.filter(field => field.isRequired) || [];
  
  // Check if any required fields are missing
  const hasMissingRequiredFields = requiredFields.some(field => {
    const fieldValue = opportunity.customFields?.[field.name];
    
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      return true;
    } else if (field.type === 'checkbox' && fieldValue !== true) {
      return true;
    }
    
    return false;
  });
  
  // Only show the alert for webhook-generated opportunities that are missing required fields
  const showRequiredFieldsAlert = isFromWebhook && hasMissingRequiredFields && requiredFields.length > 0;
  
  return (
    <>
      <Draggable draggableId={opportunity.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setIsDialogOpen(true)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {opportunity.title}
                    </h4>
                    {showRequiredFieldsAlert && (
                      <div className="shrink-0">
                        <AlertCircle className="h-4 w-4 text-amber-500" aria-label="Campos obrigatórios pendentes" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {opportunity.client}
                    {opportunity.company && ` · ${opportunity.company}`}
                  </p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs font-normal">
                      {formatCurrency(opportunity.value)}
                    </Badge>
                    
                    {showRequiredFieldsAlert && (
                      <Badge variant="outline" className="text-xs font-normal bg-amber-50 border-amber-200 text-amber-600">
                        Campos pendentes
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
      
      <OpportunityDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        opportunityId={opportunity.id}
        onOpportunityUpdated={onOpportunityUpdated}
        onOpportunityDeleted={onOpportunityDeleted}
      />
    </>
  );
};

export default OpportunityCard;
