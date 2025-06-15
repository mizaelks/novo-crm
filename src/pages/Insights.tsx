
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useInsightsData } from "@/hooks/useInsightsData";
import { Badge } from "@/components/ui/badge";
import InsightsFilters from "@/components/insights/InsightsFilters";
import InsightsStats from "@/components/insights/InsightsStats";
import InsightsCharts from "@/components/insights/InsightsCharts";
import InsightsAdvancedSettings from "@/components/insights/InsightsAdvancedSettings";

// Define the FunnelType type locally to match what the components expect
type FunnelType = 'venda' | 'relacionamento' | 'all' | 'mixed';

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
    getTotalStats,
    funnelType
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

  // CORRIGIDO - Usar diretamente o funnelType do hook que agora está corrigido
  const displayFunnelType: FunnelType = funnelType as FunnelType;
  
  console.log('Insights.tsx - selectedFunnel:', selectedFunnel, 'funnelType do hook:', funnelType, 'displayFunnelType:', displayFunnelType);

  // Get context information for better user feedback
  const getContextInfo = () => {
    if (selectedFunnel === "all") {
      const types = [...new Set(funnels.map(f => f.funnelType))];
      if (types.length === 1) {
        return {
          badge: types[0] === 'venda' 
            ? <Badge variant="default" className="bg-green-100 text-green-800">Analisando: Funis de Venda</Badge>
            : <Badge variant="secondary" className="bg-blue-100 text-blue-800">Analisando: Funis de Relacionamento</Badge>,
          description: types[0] === 'venda' 
            ? "Métricas incluem valores monetários e vendas realizadas"
            : "Métricas focam em contagem de oportunidades e relacionamentos"
        };
      } else if (types.length > 1) {
        return {
          badge: <Badge variant="outline" className="border-purple-300 text-purple-700">Analisando: Funis Mistos</Badge>,
          description: "Valores monetários e vendas apenas de funis de venda"
        };
      }
    } else {
      const selectedFunnelData = funnels.find(f => f.id === selectedFunnel);
      if (selectedFunnelData) {
        return {
          badge: selectedFunnelData.funnelType === 'venda'
            ? <Badge variant="default" className="bg-green-100 text-green-800">Analisando: {selectedFunnelData.name} (Venda)</Badge>
            : <Badge variant="secondary" className="bg-blue-100 text-blue-800">Analisando: {selectedFunnelData.name} (Relacionamento)</Badge>,
          description: selectedFunnelData.funnelType === 'venda'
            ? "Métricas incluem valores monetários e vendas realizadas"
            : "Métricas focam em contagem de oportunidades e relacionamentos"
        };
      }
    }
    
    return {
      badge: <Badge variant="outline">Contexto Indeterminado</Badge>,
      description: "Selecione um funil para ver métricas específicas"
    };
  };

  const contextInfo = getContextInfo();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Insights</h1>
          <div className="flex items-center gap-3">
            {contextInfo.badge}
            <span className="text-sm text-muted-foreground">{contextInfo.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <InsightsAdvancedSettings 
            selectedFunnel={selectedFunnel}
            funnelType={displayFunnelType}
          />
        </div>
      </div>
      
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
      
      <InsightsStats 
        loading={loading} 
        stats={stats} 
        funnelType={displayFunnelType}
      />
      <InsightsCharts
        stageDistribution={stageDistribution}
        valueOverTime={valueOverTime}
        selectedFunnel={selectedFunnel}
        funnelType={displayFunnelType}
      />
    </div>
  );
};

export default Insights;
