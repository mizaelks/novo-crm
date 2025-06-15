
import React from 'react';
import { Droppable } from "react-beautiful-dnd";
import { Opportunity, Stage } from "@/types";
import OpportunityCard from "../opportunity/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageOpportunityListProps {
  stageId: string;
  opportunities: Opportunity[];
  stage: Stage;
  onAddClick: () => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onAddTask?: (opportunity: Opportunity) => void;
  onAddField?: (opportunity: Opportunity) => void;
}

const StageOpportunityList = ({ 
  stageId, 
  opportunities, 
  stage, 
  onAddClick, 
  onOpportunityClick,
  onAddTask,
  onAddField
}: StageOpportunityListProps) => {
  // Aplicar ordenação baseada na configuração da etapa
  const getSortedOpportunities = () => {
    if (!stage.sortConfig?.enabled || stage.sortConfig.type === 'free') {
      return opportunities;
    }

    const sortedOpps = [...opportunities];
    
    if (stage.sortConfig.type === 'urgency') {
      // Ordenar por urgência (tempo na etapa)
      sortedOpps.sort((a, b) => {
        const aTime = a.lastStageChangeAt || a.createdAt;
        const bTime = b.lastStageChangeAt || b.createdAt;
        return aTime.getTime() - bTime.getTime(); // Mais antigas primeiro
      });
    } else if (stage.sortConfig.type === 'priority') {
      // Ordenar por prioridade (alertas)
      sortedOpps.sort((a, b) => {
        // Esta é uma ordenação simplificada - você pode implementar lógica mais complexa
        const aHasAlert = stage.alertConfig?.enabled && shouldShowAlert(a, stage) ? 1 : 0;
        const bHasAlert = stage.alertConfig?.enabled && shouldShowAlert(b, stage) ? 1 : 0;
        return bHasAlert - aHasAlert; // Com alerta primeiro
      });
    }
    
    return sortedOpps;
  };

  const sortedOpportunities = getSortedOpportunities();

  return (
    <div className="h-full flex flex-col">
      <Droppable droppableId={stageId}>
        {(provided, snapshot) => (
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 p-1 min-h-full ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                }`}
              >
                {sortedOpportunities.map((opportunity, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    index={index}
                    stage={stage}
                    onClick={onOpportunityClick}
                    onAddTask={onAddTask}
                    onAddField={onAddField}
                  />
                ))}
                {provided.placeholder}
              </div>
            </ScrollArea>
          </div>
        )}
      </Droppable>
      
      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova oportunidade
        </Button>
      </div>
    </div>
  );
};

// Helper function (você pode mover isso para utils se necessário)
const shouldShowAlert = (opportunity: Opportunity, stage: Stage): boolean => {
  if (!stage.alertConfig?.enabled) return false;
  
  const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
  const daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return daysInStage >= stage.alertConfig.maxDaysInStage;
};

export default StageOpportunityList;
