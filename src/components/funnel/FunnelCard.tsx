
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
  console.log('🔍 FunnelCard - Rendering funnel:', {
    id: funnel.id,
    name: funnel.name,
    stagesCount: funnel.stages?.length || 0,
    stages: funnel.stages?.map(stage => ({
      id: stage.id,
      name: stage.name,
      opportunitiesCount: stage.opportunities?.length || 0
    }))
  });
  
  // Verificar se o funnel está válido
  if (!funnel || typeof funnel !== 'object') {
    console.error('❌ FunnelCard - Invalid funnel data:', funnel);
    return null;
  }

  // Verificar se stages existe e é um array
  const stages = Array.isArray(funnel.stages) ? funnel.stages : [];
  console.log(`📊 FunnelCard - Processing ${stages.length} stages for funnel ${funnel.name}`);

  const getFunnelTypeBadge = () => {
    const funnelType = funnel.funnelType || 'venda';
    
    if (funnelType === 'venda') {
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
    const funnelType = funnel.funnelType || 'venda';
    
    if (funnelType === 'venda') {
      return "Funil focado em vendas com valores monetários";
    } else {
      return "Funil focado em relacionamentos e networking";
    }
  };

  // Calcular total de oportunidades de forma segura
  const totalOpportunities = stages.reduce((acc, stage) => {
    if (!stage || !Array.isArray(stage.opportunities)) {
      console.warn('⚠️ FunnelCard - Invalid stage or opportunities:', stage);
      return acc;
    }
    const stageOppsCount = stage.opportunities.length;
    console.log(`📈 Stage "${stage.name}": ${stageOppsCount} opportunities`);
    return acc + stageOppsCount;
  }, 0);

  console.log(`📈 FunnelCard - Total opportunities for ${funnel.name}: ${totalOpportunities}`);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle>{funnel.name || 'Funil sem nome'}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-1"
                  onClick={() => navigator.clipboard.writeText(funnel.id || '')}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  <span className="text-xs font-mono">
                    {funnel.id ? funnel.id.split('-')[0] : 'N/A'}
                  </span>
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
            <Badge variant="outline">{stages.length} etapas</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {funnel.description || 'Sem descrição'}
        </p>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Link 
          to={`/funnels/${funnel.id}`}
          className="text-sm text-primary hover:underline"
        >
          Ver detalhes
        </Link>
        <span className="text-xs text-muted-foreground">
          {totalOpportunities} oportunidade{totalOpportunities !== 1 ? 's' : ''}
        </span>
      </CardFooter>
    </Card>
  );
};

export default FunnelCard;
