
export const translateFieldType = (type: string) => {
  switch (type) {
    case "text": return "Texto";
    case "number": return "Número";
    case "date": return "Data";
    case "checkbox": return "Checkbox";
    case "select": return "Seleção";
    default: return type;
  }
};

export const translateFieldCategory = (category: string) => {
  switch (category) {
    case "leads": return "Qualificação";
    case "sales": return "Vendas";
    default: return category;
  }
};

export const translateTaskCategory = (category: string) => {
  switch (category) {
    case "contact": return "Contato";
    case "document": return "Documento";
    case "meeting": return "Reunião";
    case "followup": return "Follow-up";
    case "other": return "Outro";
    default: return category;
  }
};
