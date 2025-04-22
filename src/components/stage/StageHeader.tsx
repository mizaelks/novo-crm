
import { Stage } from "@/types";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StageHeaderProps {
  stage: Stage;
  dragHandleProps?: any;
}

const StageHeader = ({ stage, dragHandleProps }: StageHeaderProps) => {
  const totalValue = stage.opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(totalValue);

  return (
    <CardHeader 
      className="pb-2 border-b" 
      {...dragHandleProps}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            {stage.name}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 px-1"
                onClick={() => navigator.clipboard.writeText(stage.id)}
              >
                <Hash className="h-3 w-3 mr-1" />
                <span className="text-xs font-mono">{stage.id.split('-')[0]}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clique para copiar o ID</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Badge variant="outline" className="text-xs">
          {stage.opportunities.length}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>{stage.description}</span>
        <span className="font-medium">{formattedTotalValue}</span>
      </div>
    </CardHeader>
  );
};

export default StageHeader;
