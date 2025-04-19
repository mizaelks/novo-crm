
import { Link } from "react-router-dom";
import { Funnel } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FunnelCardProps {
  funnel: Funnel;
}

const FunnelCard = ({ funnel }: FunnelCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{funnel.name}</span>
          <Badge variant="outline">{funnel.stages.length} etapas</Badge>
        </CardTitle>
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
