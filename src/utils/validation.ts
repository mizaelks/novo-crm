
import { z } from "zod";

// Schemas de validação para formulários
export const opportunitySchema = z.object({
  title: z.string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título não pode ter mais de 100 caracteres"),
  client: z.string()
    .min(1, "Cliente é obrigatório")
    .min(2, "Nome do cliente deve ter pelo menos 2 caracteres"),
  value: z.number()
    .min(0, "Valor deve ser maior ou igual a zero")
    .optional(),
  phone: z.string()
    .regex(/^[\d\s\(\)\+\-\.]+$/, "Telefone deve conter apenas números e caracteres especiais válidos")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("Email deve ter um formato válido")
    .optional()
    .or(z.literal("")),
  company: z.string()
    .max(100, "Nome da empresa não pode ter mais de 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export const funnelSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome não pode ter mais de 50 caracteres"),
  description: z.string()
    .max(200, "Descrição não pode ter mais de 200 caracteres")
    .optional()
    .or(z.literal("")),
  funnelType: z.enum(["venda", "relacionamento", "all", "mixed"])
    .optional()
    .default("venda"),
});

export const stageSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(50, "Nome não pode ter mais de 50 caracteres"),
  description: z.string()
    .max(200, "Descrição não pode ter mais de 200 caracteres")
    .optional()
    .or(z.literal("")),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal (#000000)")
    .optional(),
  order: z.number()
    .min(0, "Ordem deve ser maior ou igual a zero")
    .optional(),
});

// Função utilitária para validar dados
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ["Erro de validação desconhecido"] };
  }
};

// Validações customizadas
export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length += 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};
