
import { Draggable } from "react-beautiful-dnd";
import { Opportunity, RequiredField } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useState } from "react";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { useKanbanDrag } from "../kanban/KanbanDragContext";
import { AlertCircle } from "lucide-react";
import { OpportunityQuickNavigation } from "./OpportunityQuickNavigation";

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
  
  // Get custom fields to display in the card
  const getDisplayableCustomFields = () => {
    if (!opportunity.customFields) return [];
    
    // Exclude system fields like isFromWebhook
    const systemFields = ['isFromWebhook'];
    
    return Object.entries(opportunity.customFields)
      .filter(([key, value]) => 
        !systemFields.includes(key) && 
        value !== undefined && 
        value !== null && 
        value !== ''
      )
      .slice(0, 2); // Limit to 2 fields for display in card
  };
  
  const displayableCustomFields = getDisplayableCustomFields();
  const hasCustomFields = displayableCustomFields.length > 0;
  
  const handleOpportunityMoved = () => {
    // This will trigger a refresh in the parent component
    // The actual state update is handled by the KanbanBoard context
    window.location.reload();
  };
  
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
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => setIsDialogOpen(true)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium line-clamp-2 flex-1">
                      {opportunity.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <OpportunityQuickNavigation
                        opportunityId={opportunity.id}
                        currentStageId={opportunity.stageId}
                        onOpportunityMoved={handleOpportunityMoved}
                      />
                      {showRequiredFieldsAlert && (
                        <AlertCircle className="h-4 w-4 text-amber-500" aria-label="Campos obrigatórios pendentes" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {opportunity.client}
                    {opportunity.company && ` · ${opportunity.company}`}
                  </p>
                  
                  {/* Display custom fields */}
                  {hasCustomFields && (
                    <div className="mt-1 space-y-1">
                      {displayableCustomFields.map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-xs font-normal px-1 py-0 h-5">
                            {key}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {typeof value === 'boolean' 
                              ? (value ? 'Sim' : 'Não')
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
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
