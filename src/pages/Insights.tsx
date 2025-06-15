
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useInsightsData } from "@/hooks/useInsightsData";
import InsightsFilters from "@/components/insights/InsightsFilters";
import InsightsStats from "@/components/insights/InsightsStats";
import InsightsCharts from "@/components/insights/InsightsCharts";
import InsightsAdvancedSettings from "@/components/insights/InsightsAdvancedSettings";

const Insights = () => {
  // All hooks must be called before any conditional returns
  const { isManager, loading: roleLoading } = useUserRole();
  const [selectedFunnel, setSelectedFunnel] = useState<string>("all");
  
  const {
    funnels,
    loading,
    conversionData,
    stageDistribution,
    valueOverTime,
    getTotalStats
  } = useInsightsData(selectedFunnel);

  // Now we can do conditional returns after all hooks are called
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2" />
      </div>
    );
  }

  if (!isManager) {
    return <Navigate to="/" replace />;
  }

  const stats = getTotalStats();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insights</h1>
        <div className="flex items-center gap-4">
          <InsightsFilters
            funnels={funnels}
            selectedFunnel={selectedFunnel}
            onFunnelChange={setSelectedFunnel}
          />
          <InsightsAdvancedSettings />
        </div>
      </div>
      
      <InsightsStats loading={loading} stats={stats} />
      <InsightsCharts
        conversionData={conversionData}
        stageDistribution={stageDistribution}
        valueOverTime={valueOverTime}
      />
    </div>
  );
};

export default Insights;
