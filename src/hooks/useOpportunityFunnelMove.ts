
import { useState } from 'react';
import { opportunityAPI } from '@/services/opportunityAPI';
import { toast } from 'sonner';
import { Opportunity } from '@/types';

export const useOpportunityFunnelMove = () => {
  const [isMovingBetweenFunnels, setIsMovingBetweenFunnels] = useState(false);

  const moveBetweenFunnels = async (
    opportunity: Opportunity,
    targetFunnelId: string,
    targetStageId: string,
    onSuccess?: (updatedOpportunity: Opportunity) => void
  ) => {
    if (isMovingBetweenFunnels) return null;

    setIsMovingBetweenFunnels(true);
    try {
      console.log(`Moving opportunity ${opportunity.id} to funnel ${targetFunnelId}, stage ${targetStageId}`);
      
      // Update both funnel and stage
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        funnelId: targetFunnelId,
        stageId: targetStageId
      });
      
      if (updatedOpportunity) {
        onSuccess?.(updatedOpportunity);
        toast.success("Oportunidade movida para o funil com sucesso");
        return updatedOpportunity;
      } else {
        toast.error("Erro ao mover oportunidade para o funil");
        return null;
      }
    } catch (error) {
      console.error("Error moving opportunity between funnels:", error);
      toast.error("Erro ao mover oportunidade para o funil");
      return null;
    } finally {
      setIsMovingBetweenFunnels(false);
    }
  };

  return {
    moveBetweenFunnels,
    isMovingBetweenFunnels
  };
};
