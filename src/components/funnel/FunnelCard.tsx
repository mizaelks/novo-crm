
import { Link } from "react-router-dom";
import { Funnel } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, DollarSign, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FunnelCardProps {
  funnel: Funnel;
}

const FunnelCard = ({ funnel }: FunnelCardProps) => {
  const getFunnelTypeBadge = () => {
    if (funnel.funnelType === 'venda') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          Venda
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Users className="h-3 w-3" />
          Relacionamento
        </Badge>
      );
    }
  };

  const getFunnelTypeDescription = () => {
    if (funnel.funnelType === 'venda') {
      return "Funil focado em vendas com valores monetários";
    } else {
      return "Funil focado em relacionamentos e networking";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle>{funnel.name}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-1"
                  onClick={() => navigator.clipboard.writeText(funnel.id)}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  <span className="text-xs font-mono">{funnel.id.split('-')[0]}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique para copiar o ID</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Tooltip>
              <TooltipTrigger asChild>
                {getFunnelTypeBadge()}
              </TooltipTrigger>
              <TooltipContent>
                <p>{getFunnelTypeDescription()}</p>
              </TooltipContent>
            </Tooltip>
            <Badge variant="outline">{funnel.stages.length} etapas</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{funnel.description}</p>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Link 
          to={`/funnels/${funnel.id}`}
          className="text-sm text-primary hover:underline"
        >
          Ver detalhes
        </Link>
        <span className="text-xs text-muted-foreground">
          {funnel.stages.reduce((acc, stage) => 
            acc + stage.opportunities.length, 0)} oportunidades
        </span>
      </CardFooter>
    </Card>
  );
};

export default FunnelCard;
