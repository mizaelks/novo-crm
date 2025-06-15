
import { useState, useEffect, useMemo } from "react";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useInsightsFilter } from "./insights/useInsightsFilter";
import { useStatsCalculation } from "./insights/useStatsCalculation";
import { useDataProcessing } from "./insights/useDataProcessing";
import { ValueData } from "./insights/types";

export const useInsightsData = (
  selectedFunnel: string, 
  selectedUser: string = "all",
  selectedWinReason: string = "all",
  selectedLossReason: string = "all"
) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [valueOverTime, setValueOverTime] = useState<ValueData[]>([]);
  
  const { filter } = useDateFilter();

  // Memoize filtered funnels to avoid recalculation
  const filteredFunnels = useMemo(() => {
    return selectedFunnel === "all" 
      ? funnels 
      : funnels.filter(f => f.id === selectedFunnel);
  }, [funnels, selectedFunnel]);

  // Use the filtering hook
  const { filterOpportunities } = useInsightsFilter(
    filteredFunnels,
    selectedUser,
    selectedWinReason,
    selectedLossReason
  );

  // Use the stats calculation hook
  const { getTotalStats } = useStatsCalculation(filteredFunnels, filterOpportunities);

  // Use the data processing hook
  const {
    memoizedStageDistribution,
    memoizedValueOverTime,
    funnelType
  } = useDataProcessing(
    filteredFunnels,
    filterOpportunities,
    selectedUser,
    selectedWinReason,
    selectedLossReason,
    filter
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const funnelsData = await funnelAPI.getAll();
        console.log('🔍 useInsightsData - Loaded funnels:', funnelsData);
        setFunnels(funnelsData);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update processed data when dependencies change
  useEffect(() => {
    if (!loading) {
      console.log('🔍 useInsightsData - Setting processed data:', {
        stageDistribution: memoizedStageDistribution,
        valueOverTime: memoizedValueOverTime,
        funnelType
      });
      
      // Ensure data is properly formatted before setting
      const safeStageDistribution = Array.isArray(memoizedStageDistribution) 
        ? memoizedStageDistribution.filter(item => 
            item && typeof item === 'object' && 'name' in item && 'value' in item
          )
        : [];
        
      const safeValueOverTime = Array.isArray(memoizedValueOverTime) 
        ? memoizedValueOverTime.filter(item => 
            item && typeof item === 'object' && 'month' in item && 'value' in item
          )
        : [];
      
      setStageDistribution(safeStageDistribution);
      setValueOverTime(safeValueOverTime);
    }
  }, [loading, memoizedStageDistribution, memoizedValueOverTime]);

  return {
    funnels,
    loading,
    stageDistribution,
    valueOverTime,
    getTotalStats,
    funnelType
  };
};
