
import { Funnel, Stage, Opportunity } from "@/types";

// Mapeia um objeto de banco de dados para um objeto Funnel
export const mapDbFunnelToFunnel = (db: any): Funnel => {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    order: db.order || 0,
    stages: []
  };
};

// Mapeia um objeto de banco de dados para um objeto Stage
export const mapDbStageToStage = (db: any): Stage => {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    order: db.order || 0,
    funnelId: db.funnel_id,
    opportunities: [],
    color: db.color || '#CCCCCC',
    isWinStage: db.is_win_stage || false,
    isLossStage: db.is_loss_stage || false,
    requiredFields: []
  };
};

// Mapeia um objeto de banco de dados para um objeto Opportunity
export const mapDbOpportunityToOpportunity = (db: any): Opportunity => {
  // Ensure date is properly parsed
  const createdAt = db.created_at ? new Date(db.created_at) : new Date();
  
  // Ensure custom_fields is properly parsed from JSON
  let customFields = {};
  if (db.custom_fields) {
    try {
      // Se já for um objeto, use-o diretamente
      if (typeof db.custom_fields === 'object' && db.custom_fields !== null) {
        customFields = db.custom_fields;
      } else {
        // Se for uma string JSON, analise-a
        customFields = JSON.parse(db.custom_fields);
      }
    } catch (e) {
      console.error("Erro ao analisar campos personalizados:", e);
      customFields = {};
    }
  }
  
  return {
    id: db.id,
    title: db.title,
    value: parseFloat(db.value || 0),
    client: db.client || '',
    createdAt: createdAt,
    stageId: db.stage_id,
    funnelId: db.funnel_id,
    scheduledActions: [],
    phone: db.phone,
    email: db.email,
    company: db.company,
    customFields: customFields
  };
};
