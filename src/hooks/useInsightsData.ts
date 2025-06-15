
import { useState, useEffect, useMemo } from "react";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useInsightsFilter } from "./insights/useInsightsFilter";
import { useStatsCalculation } from "./insights/useStatsCalculation";
import { useDataProcessing } from "./insights/useDataProcessing";
import { ConversionData, ValueData } from "./insights/types";

export const useInsightsData = (
  selectedFunnel: string, 
  selectedUser: string = "all",
  selectedWinReason: string = "all",
  selectedLossReason: string = "all"
) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
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
    memoizedConversionData,
    memoizedStageDistribution,
    memoizedValueOverTime
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
      setConversionData(memoizedConversionData);
      setStageDistribution(memoizedStageDistribution);
      setValueOverTime(memoizedValueOverTime);
    }
  }, [loading, memoizedConversionData, memoizedStageDistribution, memoizedValueOverTime]);

  return {
    funnels,
    loading,
    conversionData,
    stageDistribution,
    valueOverTime,
    getTotalStats
  };
};
