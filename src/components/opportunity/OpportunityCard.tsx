
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/services/utils/mappers";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MoreVertical, PhoneIcon, MailIcon, Building2Icon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import OpportunityDetailsDialog from "./OpportunityDetailsDialog";
import EditOpportunityDialog from "./EditOpportunityDialog";
import { stageAPI } from "@/services/api";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  stageId: string;
}

const OpportunityCard = ({ opportunity, index, stageId }: OpportunityCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [stage, setStage] = useState<Stage | null>(null);
  const [currentOpportunity, setCurrentOpportunity] = useState<Opportunity>(opportunity);

  React.useEffect(() => {
    const loadStage = async () => {
      try {
        const stageData = await stageAPI.getById(stageId);
        setStage(stageData);
      } catch (error) {
        console.error("Error loading stage data:", error);
      }
    };
    
    loadStage();
  }, [stageId]);

  React.useEffect(() => {
    setCurrentOpportunity(opportunity);
  }, [opportunity]);

  const handleMenuItemClick = (action: string) => {
    setIsMenuOpen(false);
    
    if (action === "edit") {
      setIsEditDialogOpen(true);
    } else if (action === "details") {
      setIsDetailsDialogOpen(true);
    }
  };

  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    setCurrentOpportunity(updatedOpportunity);
  };

  const handleCardClick = () => {
    setIsDetailsDialogOpen(true);
  };

  return (
    <Draggable draggableId={currentOpportunity.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="mb-2"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card 
            className={`${snapshot.isDragging ? "shadow-lg" : ""} cursor-pointer hover:border-primary/50 transition-colors`}
            onClick={handleCardClick}
          >
            <CardHeader className="py-3 px-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">{currentOpportunity.title}</CardTitle>
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()} // Evita que o clique propague para o Card
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleMenuItemClick("details")}>
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMenuItemClick("edit")}>
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="py-2 px-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{currentOpportunity.client}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(currentOpportunity.value)}</span>
                </div>
                
                {currentOpportunity.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PhoneIcon className="h-3 w-3" /> 
                    {currentOpportunity.phone}
                  </div>
                )}
                
                {currentOpportunity.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MailIcon className="h-3 w-3" /> 
                    {currentOpportunity.email}
                  </div>
                )}
                
                {currentOpportunity.company && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2Icon className="h-3 w-3" /> 
                    {currentOpportunity.company}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 pb-2 px-3 flex justify-between items-center">
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>{format(new Date(currentOpportunity.createdAt), "dd/MM/yyyy")}</span>
              </div>
              
              {currentOpportunity.scheduledActions && currentOpportunity.scheduledActions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {currentOpportunity.scheduledActions.length} ações
                </Badge>
              )}
            </CardFooter>
          </Card>
          
          <EditOpportunityDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            opportunityId={currentOpportunity.id}
            onOpportunityUpdated={handleOpportunityUpdated}
          />

          {stage && (
            <OpportunityDetailsDialog
              open={isDetailsDialogOpen}
              onOpenChange={setIsDetailsDialogOpen}
              opportunity={currentOpportunity}
              stage={stage}
              onEdit={() => setIsEditDialogOpen(true)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
