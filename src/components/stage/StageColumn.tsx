
import { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Stage, Opportunity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OpportunityCard from "../opportunity/OpportunityCard";
import { Badge } from "@/components/ui/badge";
import CreateOpportunityDialog from "../opportunity/CreateOpportunityDialog";

interface StageColumnProps {
  stage: Stage;
  index: number;
  funnelId: string;
  onOpportunityCreated: (opportunity: Opportunity) => void;
}

const StageColumn = ({ stage, index, funnelId, onOpportunityCreated }: StageColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const totalValue = stage.opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(totalValue);

  return (
    <Draggable draggableId={`stage-${stage.id}`} index={index}>
      {(provided) => (
        <div 
          className="w-80 flex-shrink-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Card className="h-full flex flex-col">
            <CardHeader 
              className="pb-2 border-b" 
              {...provided.dragHandleProps}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {stage.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {stage.opportunities.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{stage.description}</span>
                <span className="font-medium">{formattedTotalValue}</span>
              </div>
            </CardHeader>
            <CardContent className="p-2 flex-1">
              <Droppable droppableId={stage.id} type="opportunity">
                {(provided, snapshot) => (
                  <div
                    className={`min-h-[150px] h-full p-1 rounded-sm ${
                      snapshot.isDraggingOver ? "bg-accent/70" : ""
                    }`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {stage.opportunities.map((opportunity, index) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-muted-foreground border border-dashed border-muted-foreground/30"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
          
          <CreateOpportunityDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            stageId={stage.id}
            funnelId={funnelId}
            onOpportunityCreated={onOpportunityCreated}
          />
        </div>
      )}
    </Draggable>
  );
};

export default StageColumn;
