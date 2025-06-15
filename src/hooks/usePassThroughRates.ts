
import { useState, useEffect, useMemo } from "react";
import { stageHistoryAPI } from "@/services/stageHistoryAPI";
import { FunnelPassThroughData, PassThroughRateData, StageVelocityData } from "@/types/stageHistory";
import { useDateFilter } from "@/hooks/useDateFilter";

export const usePassThroughRates = (funnelId: string | null = null) => {
  const [funnelData, setFunnelData] = useState<FunnelPassThroughData | null>(null);
  const [stageVelocities, setStageVelocities] = useState<StageVelocityData[]>([]);
  const [loading, setLoading] = useState(false);
  const { filter } = useDateFilter();

  // Determinar intervalo de datas baseado no filtro
  const dateRange = useMemo(() => {
    if (!filter.dateRange?.from || !filter.dateRange?.to) {
      return { from: undefined, to: undefined };
    }
    return {
      from: filter.dateRange.from,
      to: filter.dateRange.to
    };
  }, [filter.dateRange]);

  useEffect(() => {
    const loadPassThroughData = async () => {
      if (!funnelId) {
        setFunnelData(null);
        setStageVelocities([]);
        return;
      }

      setLoading(true);
      try {
        // Carregar dados de taxa de passagem do funil
        const data = await stageHistoryAPI.getFunnelPassThroughRates(
          funnelId, 
          dateRange.from, 
          dateRange.to
        );
        setFunnelData(data);

        // Carregar velocidades das etapas
        if (data?.stages) {
          const velocities = await Promise.all(
            data.stages.map(stage => 
              stageHistoryAPI.getStageVelocity(stage.stageId, dateRange.from, dateRange.to)
            )
          );
          setStageVelocities(velocities.filter(Boolean) as StageVelocityData[]);
        }
      } catch (error) {
        console.error("Error loading pass-through data:", error);
        setFunnelData(null);
        setStageVelocities([]);
      } finally {
        setLoading(false);
      }
    };

    loadPassThroughData();
  }, [funnelId, dateRange.from, dateRange.to]);

  return {
    funnelData,
    stageVelocities,
    loading,
    passThroughRates: funnelData?.stages || [],
    overallConversionRate: funnelData?.overallConversionRate || 0,
    averageVelocity: funnelData?.averageVelocity || 0
  };
};
