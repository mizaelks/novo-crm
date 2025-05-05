
import { RequiredField } from "@/types";

export interface FieldTemplate {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "checkbox" | "select";
  options?: string[];
  description: string;
  icon: string; // Lucide icon name
}

// Templates pré-definidos para campos personalizados
export const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: "origin",
    name: "Origem do Lead",
    type: "select",
    options: ["Site", "Indicação", "Google", "Redes Sociais", "Email", "Evento", "Outro"],
    description: "De onde veio este lead",
    icon: "users"
  },
  {
    id: "budget",
    name: "Orçamento Disponível",
    type: "select",
    options: ["Até R$ 1.000", "R$ 1.000 - R$ 5.000", "R$ 5.000 - R$ 10.000", "R$ 10.000 - R$ 50.000", "Acima de R$ 50.000", "A definir"],
    description: "Orçamento do cliente para o projeto",
    icon: "wallet"
  },
  {
    id: "priority",
    name: "Prioridade",
    type: "select",
    options: ["Baixa", "Média", "Alta", "Urgente"],
    description: "Prioridade deste negócio",
    icon: "alert-circle"
  },
  {
    id: "decision_maker",
    name: "Tomador de Decisão",
    type: "text",
    description: "Nome da pessoa que toma decisões",
    icon: "user-check"
  },
  {
    id: "next_followup",
    name: "Próximo Contato",
    type: "date",
    description: "Data para o próximo contato",
    icon: "calendar"
  },
  {
    id: "approved",
    name: "Proposta Aprovada",
    type: "checkbox",
    description: "Cliente aprovou a proposta",
    icon: "check-circle"
  },
  {
    id: "deadline",
    name: "Prazo de Entrega",
    type: "date",
    description: "Prazo para entrega do projeto",
    icon: "clock"
  },
  {
    id: "payment_terms",
    name: "Condições de Pagamento",
    type: "select",
    options: ["À vista", "30 dias", "60 dias", "90 dias", "Parcelado", "Personalizado"],
    description: "Forma de pagamento acordada",
    icon: "credit-card"
  },
  {
    id: "interest_level",
    name: "Nível de Interesse",
    type: "select",
    options: ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
    description: "Quão interessado está o cliente",
    icon: "thermometer"
  },
  {
    id: "product_interest",
    name: "Produto de Interesse",
    type: "select",
    options: ["Produto A", "Produto B", "Produto C", "Serviço X", "Serviço Y", "Personalizado"],
    description: "Qual produto/serviço interessa ao cliente",
    icon: "package"
  },
  {
    id: "contact_preference",
    name: "Preferência de Contato",
    type: "select",
    options: ["E-mail", "Telefone", "WhatsApp", "Presencial", "Videoconferência"],
    description: "Como o cliente prefere ser contatado",
    icon: "phone"
  },
  {
    id: "meeting_notes",
    name: "Notas da Reunião",
    type: "text",
    description: "Anotações importantes da última reunião",
    icon: "clipboard"
  }
];

// Função para converter um template em um RequiredField
export const templateToRequiredField = (template: FieldTemplate, stageId: string): RequiredField => {
  return {
    id: crypto.randomUUID(),
    name: template.name,
    type: template.type,
    options: template.options,
    isRequired: true,
    stageId: stageId
  };
};
