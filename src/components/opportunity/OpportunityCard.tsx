
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity, Stage } from "@/types";
import { formatCurrency } from "@/services/utils/dateUtils";
import { OpportunityAlerts } from "./OpportunityAlerts";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  stage: Stage;
  onClick?: (opportunity: Opportunity) => void;
}

const OpportunityCard = ({ opportunity, index, stage, onClick }: OpportunityCardProps) => {
  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg rotate-2" : ""
          }`}
          onClick={() => onClick?.(opportunity)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-sm leading-tight">
                {opportunity.title}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {formatCurrency(opportunity.value)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{opportunity.client}</p>
            <OpportunityAlerts opportunity={opportunity} stage={stage} />
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
