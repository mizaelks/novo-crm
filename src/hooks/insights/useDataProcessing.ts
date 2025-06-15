
import { useCallback, useMemo } from "react";
import { Funnel } from "@/types";
import { ValueData } from "./types";

export const useDataProcessing = (
  filteredFunnels: Funnel[],
  filterOpportunities: (opportunities: any[], stageId?: string) => any[],
  selectedUser: string,
  selectedWinReason: string,
  selectedLossReason: string,
  filter: any
) => {
  // Determinar o tipo de funil selecionado
  const getFunnelType = useCallback((): 'venda' | 'relacionamento' | 'all' | 'mixed' => {
    console.log('🔍 getFunnelType - Analisando funis:', filteredFunnels.map(f => ({ 
      id: f.id, 
      name: f.name, 
      type: f.funnelType 
    })));
    
    if (filteredFunnels.length === 0) return 'all';
    if (filteredFunnels.length === 1) {
      const singleType = filteredFunnels[0].funnelType;
      console.log('✅ getFunnelType - Funil único encontrado:', singleType);
      return singleType;
    }
    
    // Se há múltiplos funis (caso "all"), verificar se são todos do mesmo tipo
    const types = [...new Set(filteredFunnels.map(f => f.funnelType))];
    console.log('📊 getFunnelType - Múltiplos funis, tipos únicos:', types);
    
    if (types.length === 1) {
      console.log('✅ getFunnelType - Todos do mesmo tipo:', types[0]);
      return types[0];
    } else {
      console.log('🔄 getFunnelType - Tipos mistos detectados');
      return 'mixed';
    }
  }, [filteredFunnels]);

  const processStageDistribution = useCallback((funnelsData: Funnel[]) => {
    const stageData: { [key: string]: number } = {};
    
    console.log('📈 processStageDistribution - Processando distribuição para:', 
      funnelsData.map(f => ({ name: f.name, type: f.funnelType })));
    
    funnelsData.forEach(funnel => {
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        if (!stageData[stage.name]) {
          stageData[stage.name] = 0;
        }
        stageData[stage.name] += filteredOpportunities.length;
        
        if (filteredOpportunities.length > 0) {
          console.log(`📊 Estágio "${stage.name}" (${funnel.funnelType}): ${filteredOpportunities.length} oportunidades`);
        }
      });
    });

    const result = Object.entries(stageData)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
      
    console.log('✅ processStageDistribution - Resultado final:', result);
    return result;
  }, [filterOpportunities]);

  const processValueOverTime = useCallback((funnelsData: Funnel[]) => {
    const monthData: { [key: string]: number } = {};
    const funnelType = getFunnelType();
    
    console.log('⏰ processValueOverTime - Processando dados temporais para tipo:', funnelType);
    
    funnelsData.forEach(funnel => {
      console.log(`📅 Processando funil "${funnel.name}" (${funnel.funnelType})`);
      
      funnel.stages.forEach(stage => {
        const filteredOpportunities = filterOpportunities(stage.opportunities, stage.id);
        filteredOpportunities.forEach(opp => {
          const date = new Date(opp.createdAt);
          const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          if (!monthData[month]) {
            monthData[month] = 0;
          }
          
          // Para funis de venda ou mixed, usar valor. Para relacionamento, usar contagem
          if (funnelType === 'venda' || funnelType === 'mixed' || funnelType === 'all') {
            // Se é funil de venda, usar valor; se é relacionamento ou mixed, usar contagem
            if (funnel.funnelType === 'venda') {
              monthData[month] += opp.value;
              console.log(`💰 Adicionando valor R$ ${opp.value} para ${month} (funil de venda)`);
            } else {
              monthData[month] += 1; // contagem para funis de relacionamento
              console.log(`👥 Adicionando 1 contagem para ${month} (funil de relacionamento)`);
            }
          } else {
            // Apenas funis de relacionamento - usar contagem
            monthData[month] += 1;
            console.log(`👥 Adicionando 1 contagem para ${month} (apenas relacionamento)`);
          }
        });
      });
    });

    // Ordenar por data e pegar os últimos 6 meses
    const sortedData = Object.entries(monthData)
      .map(([month, value]) => ({ month, value, date: new Date(month) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6)
      .map(({ month, value }) => ({ month, value }));

    console.log('✅ processValueOverTime - Resultado final:', sortedData);
    return sortedData;
  }, [filterOpportunities, getFunnelType]);

  // Memoize processed data to prevent unnecessary recalculations
  const memoizedStageDistribution = useMemo(() => 
    processStageDistribution(filteredFunnels), 
    [processStageDistribution, filteredFunnels, filter, selectedUser, selectedWinReason, selectedLossReason]
  );

  const memoizedValueOverTime = useMemo(() => 
    processValueOverTime(filteredFunnels), 
    [processValueOverTime, filteredFunnels, selectedUser, selectedWinReason, selectedLossReason]
  );

  const funnelType = getFunnelType();
  
  console.log('🎯 useDataProcessing - Tipo final determinado:', funnelType);

  return {
    memoizedStageDistribution,
    memoizedValueOverTime,
    funnelType
  };
};
