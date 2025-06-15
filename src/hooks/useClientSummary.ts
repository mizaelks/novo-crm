
import { useMemo } from "react";
import { Opportunity } from "@/types";

interface UseClientSummaryProps {
  opportunities: Opportunity[];
  uniqueClients: string[];
  showUniqueClients: boolean;
  applyDateFilter: (opportunity: Opportunity) => boolean;
}

export const useClientSummary = ({
  opportunities,
  uniqueClients,
  showUniqueClients,
  applyDateFilter
}: UseClientSummaryProps) => {
  const clientSummary = useMemo(() => {
    if (!showUniqueClients) return null;
    
    const summary = uniqueClients.map(client => {
      const clientOpportunities = opportunities.filter(
        opp => opp.client === client && applyDateFilter(opp)
      );
      
      const totalValue = clientOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const opportunityCount = clientOpportunities.length;
      
      const mostRecent = clientOpportunities.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, null as Opportunity | null);
      
      return {
        client,
        opportunityCount,
        totalValue,
        mostRecentDate: mostRecent ? mostRecent.createdAt.toString() : null,
        funnelId: mostRecent ? mostRecent.funnelId : null,
        stageId: mostRecent ? mostRecent.stageId : null
      };
    });
    
    return summary;
  }, [opportunities, uniqueClients, showUniqueClients, applyDateFilter]);

  return clientSummary;
};
