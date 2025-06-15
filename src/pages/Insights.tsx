
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
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedWinReason, setSelectedWinReason] = useState<string>("all");
  const [selectedLossReason, setSelectedLossReason] = useState<string>("all");
  
  const {
    funnels,
    loading,
    stageDistribution,
    valueOverTime,
    getTotalStats
  } = useInsightsData(selectedFunnel, selectedUser, selectedWinReason, selectedLossReason);

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

  // Determinar o tipo de funil selecionado para ajustar as estatísticas
  const selectedFunnelData = funnels.find(f => f.id === selectedFunnel);
  const funnelType = selectedFunnel === "all" ? "all" : selectedFunnelData?.funnelType || "venda";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insights</h1>
        <div className="flex items-center gap-4">
          <InsightsFilters
            funnels={funnels}
            selectedFunnel={selectedFunnel}
            onFunnelChange={setSelectedFunnel}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
            selectedWinReason={selectedWinReason}
            onWinReasonChange={setSelectedWinReason}
            selectedLossReason={selectedLossReason}
            onLossReasonChange={setSelectedLossReason}
          />
          <InsightsAdvancedSettings />
        </div>
      </div>
      
      <InsightsStats 
        loading={loading} 
        stats={stats} 
        funnelType={funnelType}
      />
      <InsightsCharts
        stageDistribution={stageDistribution}
        valueOverTime={valueOverTime}
        selectedFunnel={selectedFunnel}
      />
    </div>
  );
};

export default Insights;
