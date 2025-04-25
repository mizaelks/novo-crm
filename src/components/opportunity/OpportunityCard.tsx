
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Opportunity, Stage } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Hash, Phone, Mail, Building } from "lucide-react";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import { ScrollArea } from "../ui/scroll-area";
import { useStageAPI } from "@/services/api";
import { useEffect, useRef } from "react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  stageId: string; // Adicionar stageId como propriedade
}

const OpportunityCard = ({ opportunity, index, stageId }: OpportunityCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [stage, setStage] = useState<Stage | null>(null);
  const { stageAPI } = useStageAPI();
  
  useEffect(() => {
    const loadStage = async () => {
      try {
        const loadedStage = await stageAPI.getById(stageId);
        if (loadedStage) {
          setStage(loadedStage);
        }
      } catch (error) {
        console.error("Error loading stage:", error);
      }
    };
    
    loadStage();
  }, [stageId, stageAPI]);
  
  const formattedValue = formatCurrency(opportunity.value);
  const formattedDate = formatDateBRT(opportunity.createdAt);

  const hasScheduledActions = opportunity.scheduledActions?.some(
    action => action.status === 'pending'
  );

  // Ensure we display company, email and phone if they exist
  const hasContactInfo = opportunity.company || opportunity.email || opportunity.phone;

  if (!stage) {
    // Retornar um card básico enquanto carrega o stage
    return (
      <Draggable draggableId={opportunity.id} index={index}>
        {(provided) => (
          <Card
            className="mb-2"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{opportunity.title}</h3>
                <span className="text-primary font-semibold text-sm">
                  {formattedValue}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Cliente: {opportunity.client}
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  }

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
              <ScrollArea className="max-h-[300px]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{opportunity.title}</h3>
                    <span className="text-primary font-semibold text-sm">
                      {formattedValue}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Cliente: {opportunity.client}</div>
                    
                    {opportunity.company && (
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {opportunity.company}
                      </div>
                    )}
                    
                    {opportunity.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {opportunity.phone}
                      </div>
                    )}
                    
                    {opportunity.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {opportunity.email}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formattedDate}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(opportunity.id);
                            }}
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            <span className="text-xs font-mono">{opportunity.id.split('-')[0]}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clique para copiar o ID</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {hasScheduledActions && (
                      <div className="flex items-center text-xs text-secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Ação agendada
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </Draggable>

      {stage && (
        <OpportunityDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          opportunity={opportunity}
          stage={stage}
        />
      )}
    </>
  );
};

export default OpportunityCard;
