
import { useState } from 'react';
import { opportunityAPI } from '@/services/opportunityAPI';
import { toast } from 'sonner';
import { Opportunity, Stage } from '@/types';

export const useOpportunityMove = () => {
  const [isMoving, setIsMoving] = useState(false);

  const moveOpportunity = async (
    opportunity: Opportunity,
    targetStageId: string,
    onSuccess?: (updatedOpportunity: Opportunity) => void
  ) => {
    if (isMoving) return;

    setIsMoving(true);
    try {
      const updatedOpportunity = await opportunityAPI.move(opportunity.id, targetStageId);
      
      if (updatedOpportunity) {
        onSuccess?.(updatedOpportunity);
        toast.success("Oportunidade movida com sucesso");
        return updatedOpportunity;
      } else {
        toast.error("Erro ao mover oportunidade");
        return null;
      }
    } catch (error) {
      console.error("Error moving opportunity:", error);
      toast.error("Erro ao mover oportunidade");
      return null;
    } finally {
      setIsMoving(false);
    }
  };

  return {
    moveOpportunity,
    isMoving
  };
};
