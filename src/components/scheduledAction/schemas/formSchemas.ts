
import { z } from "zod";

// Schema de validação para webhook
export const webhookSchema = z.object({
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  method: z.string().min(1, "Método é obrigatório"),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
  moveToNextStage: z.boolean().default(false),
  description: z.string().optional(),
  taskType: z.literal("webhook")
});

// Schema de validação para tarefas
export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Horário é obrigatório"),
  moveToNextStage: z.boolean().default(false),
  assignedTo: z.string().optional(),
  taskType: z.literal("task")
});

// União dos schemas
export const formSchema = z.discriminatedUnion("taskType", [webhookSchema, taskSchema]);

export type FormValues = z.infer<typeof formSchema>;
