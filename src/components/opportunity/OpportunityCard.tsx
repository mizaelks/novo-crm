
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Eye, Edit, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { OpportunityAlertIndicator } from "./OpportunityAlertIndicator";
import { OpportunityMigrationIndicator } from "./OpportunityMigrationIndicator";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onEdit: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  stageColor?: string;
  isWinStage?: boolean;
  isLossStage?: boolean;
  maxDaysInStage?: number;
}

const OpportunityCard = ({ 
  opportunity, 
  index, 
  onEdit, 
  onView,
  stageColor,
  isWinStage,
  isLossStage,
  maxDaysInStage
}: OpportunityCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening details when clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onView(opportunity);
  };

  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'rotate-1 scale-105' : ''}`}
        >
          <Card 
            className="cursor-pointer hover:shadow-md transition-all duration-200 group"
            onClick={handleCardClick}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                    {opportunity.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{opportunity.client}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <Badge variant="outline" className="text-xs px-2 py-0" style={{ borderColor: stageColor }}>
                    {formatCurrency(opportunity.value)}
                  </Badge>
                  <OpportunityMigrationIndicator opportunity={opportunity} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(opportunity.createdAt, "dd/MM")}</span>
                  <OpportunityAlertIndicator 
                    opportunity={opportunity}
                    maxDaysInStage={maxDaysInStage}
                  />
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(opportunity);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(opportunity);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {opportunity.company && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{opportunity.company}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
