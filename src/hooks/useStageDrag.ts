
import { stageAPI } from "@/services/api";
import { Stage } from "@/types";
import { toast } from "sonner";

export const useStageDrag = (
  stages: Stage[],
  funnelId: string,
  setStages: (stages: Stage[]) => void
) => {
  const handleStageDrag = async (
    stageId: string, 
    sourceIndex: number, 
    destinationIndex: number
  ) => {
    if (sourceIndex === destinationIndex) return;
    
    console.log(`Reordering stage ${stageId} from position ${sourceIndex} to ${destinationIndex}`);
    
    try {
      // Create a new array with the stages in the correct order
      const updatedStages = Array.from(stages);
      
      // Remove the dragged stage
      const [removedStage] = updatedStages.splice(sourceIndex, 1);
      
      // Insert it at the new position
      updatedStages.splice(destinationIndex, 0, removedStage);
      
      // Update the order property for each stage
      const reorderedStages = updatedStages.map((stage, index) => ({
        ...stage,
        order: index
      }));
      
      // Optimistically update UI first
      setStages(reorderedStages);
      
      // Update the order in the database for all stages to ensure consistency
      const updatePromises = reorderedStages.map(stage => 
        stageAPI.update(stage.id, { order: stage.order })
      );
      
      await Promise.all(updatePromises);
      
      toast.success("Etapas reordenadas com sucesso");
    } catch (error) {
      console.error("Error reordering stages:", error);
      toast.error("Erro ao reordenar etapas");
      
      // Refresh the stages from the server to ensure consistent state
      try {
        const refreshedStages = await stageAPI.getByFunnelId(funnelId);
        setStages(refreshedStages);
      } catch (refreshError) {
        console.error("Error refreshing stages:", refreshError);
      }
    }
  };

  return { handleStageDrag };
};
