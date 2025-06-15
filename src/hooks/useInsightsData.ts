
import { useState, useEffect } from "react";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { useDateFilter } from "@/hooks/useDateFilter";

interface ConversionData {
  stageName: string;
  opportunities: number;
  conversionRate: number;
}

interface ValueData {
  month: string;
  value: number;
}

export const useInsightsData = (selectedFunnel: string) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [stageDistribution, setStageDistribution] = useState<any[]>([]);
  const [valueOverTime, setValueOverTime] = useState<ValueData[]>([]);
  
  const { filter, filterByDate } = useDateFilter();

  const processConversionData = (funnelsData: Funnel[]) => {
    const stageData: { [key: string]: { total: number, converted: number } } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach((stage, index) => {
        if (!stageData[stage.name]) {
          stageData[stage.name] = { total: 0, converted: 0 };
        }
        
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        stageData[stage.name].total += filteredOpportunities.length;
        
        // Calculate conversions (opportunities that moved to next stage)
        if (index < funnel.stages.length - 1) {
          const nextStage = funnel.stages[index + 1];
          const nextStageOpps = filterByDate(nextStage.opportunities, 'createdAt');
          stageData[stage.name].converted += nextStageOpps.length;
        }
      });
    });

    const conversionArray = Object.entries(stageData).map(([stageName, data]) => ({
      stageName,
      opportunities: data.total,
      conversionRate: data.total > 0 ? Math.round((data.converted / data.total) * 100) : 0
    }));

    setConversionData(conversionArray);
  };

  const processStageDistribution = (funnelsData: Funnel[]) => {
    const stageData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        if (!stageData[stage.name]) {
          stageData[stage.name] = 0;
        }
        stageData[stage.name] += filteredOpportunities.length;
      });
    });

    const distributionArray = Object.entries(stageData).map(([name, value]) => ({
      name,
      value
    }));

    setStageDistribution(distributionArray);
  };

  const processValueOverTime = (funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        stage.opportunities.forEach(opp => {
          const month = new Date(opp.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          monthData[month] += opp.value;
        });
      });
    });

    const valueArray = Object.entries(monthData).map(([month, value]) => ({
      month,
      value
    }));

    setValueOverTime(valueArray.slice(-6)); // Last 6 months
  };

  const getTotalStats = () => {
    const filteredFunnels = selectedFunnel === "all" 
      ? funnels 
      : funnels.filter(f => f.id === selectedFunnel);
    
    let totalOpportunities = 0;
    let totalValue = 0;
    let totalSales = 0;
    let totalSalesValue = 0;

    filteredFunnels.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterByDate(stage.opportunities, 'createdAt');
        totalOpportunities += filteredOpportunities.length;
        
        filteredOpportunities.forEach(opp => {
          totalValue += opp.value;
          if (stage.isWinStage) {
            totalSales++;
            totalSalesValue += opp.value;
          }
        });
      });
    });

    return { totalOpportunities, totalValue, totalSales, totalSalesValue };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const funnelsData = await funnelAPI.getAll();
        setFunnels(funnelsData);
        
        // Process data for charts
        const filteredFunnels = selectedFunnel === "all" 
          ? funnelsData 
          : funnelsData.filter(f => f.id === selectedFunnel);
        
        processConversionData(filteredFunnels);
        processStageDistribution(filteredFunnels);
        processValueOverTime(filteredFunnels);
      } catch (error) {
        console.error("Error loading insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFunnel, filter, filterByDate]);

  return {
    funnels,
    loading,
    conversionData,
    stageDistribution,
    valueOverTime,
    getTotalStats
  };
};
