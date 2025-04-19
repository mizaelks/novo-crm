
import { Stage } from "@/types";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  );
};

export default StageHeader;
