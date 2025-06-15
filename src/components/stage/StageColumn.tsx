
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
  const [taskDialogOpportunity, setTaskDialogOpportunity] = useState<Opportunity | null>(null);
  const [fieldDialogOpportunity, setFieldDialogOpportunity] = useState<Opportunity | null>(null);
  
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunityId(opportunity.id);
  };

  const handleAddTask = (opportunity: Opportunity) => {
    setTaskDialogOpportunity(opportunity);
    // Aqui você pode abrir um dialog específico para adicionar tarefas
    console.log('Add task for opportunity:', opportunity.id);
  };

  const handleAddField = (opportunity: Opportunity) => {
    setFieldDialogOpportunity(opportunity);
    // Aqui você pode abrir um dialog específico para adicionar campos
    console.log('Add field for opportunity:', opportunity.id);
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
    // Close the details dialog if it's open for this opportunity
    if (selectedOpportunityId === opportunityId) {
      setSelectedOpportunityId(null);
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
              />
              <CardContent className="p-3 flex-1 overflow-hidden">
                <StageOpportunityList
                  stageId={stage.id}
                  opportunities={stage.opportunities}
                  stage={stage}
                  onAddClick={() => setIsDialogOpen(true)}
                  onOpportunityClick={handleOpportunityClick}
                  onAddTask={handleAddTask}
                  onAddField={handleAddField}
                />
              </CardContent>
            </Card>
            
            <CreateOpportunityDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              stageId={stage.id}
              funnelId={funnelId}
              onOpportunityCreated={onOpportunityCreated}
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
