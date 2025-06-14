
import { opportunityAPI, stageAPI } from "../api";
import { Opportunity, Stage } from "@/types";
import { toast } from "sonner";

export const checkAndMigrateOpportunity = async (
  opportunity: Opportunity,
  destinationStage: Stage
): Promise<void> => {
  // Check if the destination stage has migration configured
  if (!destinationStage.migrateConfig?.enabled) {
    return;
  }

  const { targetFunnelId, targetStageId } = destinationStage.migrateConfig;

  if (!targetFunnelId || !targetStageId) {
    console.warn("Migration config incomplete for stage:", destinationStage.id);
    return;
  }

  try {
    console.log(`Migrating opportunity ${opportunity.id} to funnel ${targetFunnelId}`);

    // Create a new opportunity in the target funnel
    const migratedOpportunity = await opportunityAPI.create({
      title: opportunity.title,
      client: opportunity.client,
      value: opportunity.value,
      stageId: targetStageId,
      funnelId: targetFunnelId,
      phone: opportunity.phone,
      email: opportunity.email,
      company: opportunity.company,
      customFields: opportunity.customFields || {}
    });

    // Update the migrated opportunity to reference the original
    await opportunityAPI.update(migratedOpportunity.id, {
      sourceOpportunityId: opportunity.id
    });

    console.log(`Opportunity migrated successfully: ${migratedOpportunity.id}`);
    
    // Show success message
    toast.success(`Oportunidade migrada automaticamente para outro funil`, {
      description: `"${opportunity.title}" foi clonada para o funil de destino`
    });

  } catch (error) {
    console.error("Error migrating opportunity:", error);
    toast.error("Erro ao migrar oportunidade automaticamente");
  }
};
