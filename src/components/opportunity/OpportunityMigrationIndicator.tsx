
import React from 'react';
import { Opportunity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OpportunityMigrationIndicatorProps {
  opportunity: Opportunity;
}

export const OpportunityMigrationIndicator: React.FC<OpportunityMigrationIndicatorProps> = ({ 
  opportunity 
}) => {
  if (!opportunity.sourceOpportunityId) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Copy className="h-3 w-3" />
            Migrada
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <span>Oportunidade criada por migração automática</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
