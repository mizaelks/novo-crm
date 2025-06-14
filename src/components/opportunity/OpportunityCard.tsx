
import { Draggable } from "react-beautiful-dnd";
import { Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/services/utils/dateUtils";
import { useState } from "react";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";
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
  
  // Check if this opportunity was created from webhook/API and is missing required fields
  const isFromWebhook = opportunity.customFields?.isFromWebhook === true;
  
  // For now, we'll show a placeholder for required fields alert
  // This would need to be integrated with the stage's required fields
  const showRequiredFieldsAlert = isFromWebhook;
  
  // Placeholder for stage alert - would need current stage info
  const showStageAlert = false;
  const stageAlertMessage = '';
  
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
    // Let the parent components handle the state updates naturally
    console.log("Opportunity moved via quick navigation");
  };
  
  return (
    <>
      <Draggable draggableId={`opportunity-${opportunity.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
            style={{
              ...provided.draggableProps.style,
              userSelect: 'none'
            }}
          >
            <Card 
              className={`cursor-pointer hover:shadow-md transition-shadow group ${
                snapshot.isDragging ? "rotate-2 shadow-lg" : ""
              }`}
              onClick={(e) => {
                // Prevent click when dragging
                if (!snapshot.isDragging) {
                  setIsDialogOpen(true);
                }
              }}
              style={{ userSelect: 'none' }}
            >
              <CardContent className="p-3" style={{ userSelect: 'none' }}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium line-clamp-2 flex-1" style={{ userSelect: 'none' }}>
                      {opportunity.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <OpportunityQuickNavigation
                          opportunityId={opportunity.id}
                          currentStageId={opportunity.stageId}
                          onOpportunityMoved={handleOpportunityMoved}
                        />
                      </div>
                      {showRequiredFieldsAlert && (
                        <AlertCircle className="h-4 w-4 text-amber-500" aria-label="Campos obrigatórios pendentes" />
                      )}
                      {showStageAlert && (
                        <Clock className="h-4 w-4 text-red-500" aria-label="Alerta de tempo na etapa" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-1" style={{ userSelect: 'none' }}>
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
                          <span className="text-xs text-muted-foreground truncate" style={{ userSelect: 'none' }}>
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
                    
                    <div className="flex gap-1">
                      {showRequiredFieldsAlert && (
                        <Badge variant="outline" className="text-xs font-normal bg-amber-50 border-amber-200 text-amber-600">
                          Campos pendentes
                        </Badge>
                      )}
                      {showStageAlert && (
                        <Badge variant="outline" className="text-xs font-normal bg-red-50 border-red-200 text-red-600">
                          {stageAlertMessage}
                        </Badge>
                      )}
                    </div>
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
