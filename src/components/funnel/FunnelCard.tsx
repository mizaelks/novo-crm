
import { Link } from "react-router-dom";
import { Funnel } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FunnelCardProps {
  funnel: Funnel;
}

const FunnelCard = ({ funnel }: FunnelCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
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
          <Badge variant="outline">{funnel.stages.length} etapas</Badge>
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
