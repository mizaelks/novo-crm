
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Stage, Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import CreateOpportunityDialog from "../opportunity/CreateOpportunityDialog";
import OpportunityDetailsDialog from "../opportunity/OpportunityDetailsDialog";
import StageHeader from "./StageHeader";
import StageOpportunityList from "./StageOpportunityList";

interface StageColumnProps {
  stage: Stage;
  index: number;
  funnelId: string;
  onOpportunityCreated: (opportunity: Opportunity) => void;
  onStageUpdated?: (stage: Stage) => void;
  onOpportunityUpdated?: (opportunity: Opportunity) => void;
  onOpportunityDeleted?: (opportunityId: string) => void;
}

const StageColumn = ({ 
  stage, 
  index, 
  funnelId, 
  onOpportunityCreated, 
  onStageUpdated,
  onOpportunityUpdated,
  onOpportunityDeleted
}: StageColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunityId(opportunity.id);
  };

  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    console.log('Opportunity updated in StageColumn:', updatedOpportunity);
    if (onOpportunityUpdated) {
      onOpportunityUpdated(updatedOpportunity);
    }
  };

  const handleOpportunityDeleted = (opportunityId: string) => {
    console.log('Opportunity deleted in StageColumn:', opportunityId);
    if (onOpportunityDeleted) {
      onOpportunityDeleted(opportunityId);
    }
    if (selectedOpportunityId === opportunityId) {
      setSelectedOpportunityId(null);
    }
  };

  const handleAddOpportunity = () => {
    setIsDialogOpen(true);
  };

  const handleOpportunityCreatedWrapper = () => {
    // Trigger a refresh without needing the opportunity object
    // The parent component will handle reloading the data
    if (onOpportunityCreated) {
      // Call with a dummy opportunity object or trigger a refresh
      window.location.reload();
    }
  };
  
  return (
    <Draggable draggableId={stage.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="w-80 flex-shrink-0"
            style={{
              ...provided.draggableProps.style,
            }}
          >
            <Card className={`h-full flex flex-col ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
              <StageHeader 
                stage={stage}
                dragHandleProps={provided.dragHandleProps}
                updateStage={onStageUpdated}
                onAddOpportunity={handleAddOpportunity}
              />
              <CardContent className="p-3 flex-1 overflow-hidden">
                <StageOpportunityList
                  stageId={stage.id}
                  opportunities={stage.opportunities}
                  stage={stage}
                  onOpportunityClick={handleOpportunityClick}
                />
              </CardContent>
            </Card>
            
            <CreateOpportunityDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              stageId={stage.id}
              funnelId={funnelId}
              onOpportunityCreated={handleOpportunityCreatedWrapper}
            />
            
            {selectedOpportunityId && (
              <OpportunityDetailsDialog
                open={!!selectedOpportunityId}
                onOpenChange={(open) => {
                  if (!open) setSelectedOpportunityId(null);
                }}
                opportunityId={selectedOpportunityId}
                onOpportunityUpdated={handleOpportunityUpdated}
                onOpportunityDeleted={handleOpportunityDeleted}
              />
            )}
          </div>
        );
      }}
    </Draggable>
  );
};

export default StageColumn;
