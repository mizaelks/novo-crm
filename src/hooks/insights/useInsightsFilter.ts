
import { useCallback } from "react";
import { Funnel } from "@/types";
import { useDateFilter } from "@/hooks/useDateFilter";

export const useInsightsFilter = (
  filteredFunnels: Funnel[],
  selectedUser: string,
  selectedWinReason: string,
  selectedLossReason: string
) => {
  const { filterByDate } = useDateFilter();

  const filterOpportunities = useCallback((opportunities: any[], stageId?: string) => {
    let filtered = opportunities;

    // Filter by date
    filtered = filterByDate(filtered, 'createdAt');

    // Filter by user
    if (selectedUser !== "all") {
      filtered = filtered.filter(opp => opp.userId === selectedUser);
    }

    // Filter by win reason - only for opportunities in win stages
    if (selectedWinReason !== "all") {
      filtered = filtered.filter(opp => {
        // Find the stage this opportunity belongs to
        const stage = filteredFunnels
          .flatMap(f => f.stages)
          .find(s => s.id === (stageId || opp.stageId));
        
        // Only filter by win reason if the opportunity is in a win stage
        if (stage?.isWinStage) {
          return opp.winReason === selectedWinReason;
        }
        
        // If not in a win stage, don't filter by win reason
        return true;
      });
    }

    // Filter by loss reason - only for opportunities in loss stages
    if (selectedLossReason !== "all") {
      filtered = filtered.filter(opp => {
        // Find the stage this opportunity belongs to
        const stage = filteredFunnels
          .flatMap(f => f.stages)
          .find(s => s.id === (stageId || opp.stageId));
        
        // Only filter by loss reason if the opportunity is in a loss stage
        if (stage?.isLossStage) {
          return opp.lossReason === selectedLossReason;
        }
        
        // If not in a loss stage, don't filter by loss reason
        return true;
      });
    }

    return filtered;
  }, [filterByDate, selectedUser, selectedWinReason, selectedLossReason, filteredFunnels]);

  return { filterOpportunities };
};
