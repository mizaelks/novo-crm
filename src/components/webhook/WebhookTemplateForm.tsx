import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { WebhookTemplate, WebhookTemplateFormData } from "@/types";
import { webhookTemplateAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebhookTemplateFormProps {
  onTemplateCreated?: (template: WebhookTemplate) => void;
  initialValues?: Partial<WebhookTemplateFormData>;
  templateId?: string;
  isEditing?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  url: z.string().url("URL inválida").min(1, "URL é obrigatória"),
  targetType: z.enum(["funnel", "stage", "opportunity"], {
    required_error: "Tipo de alvo é obrigatório",
  }),
  event: z.enum(["create", "update", "move"], {
    required_error: "Evento é obrigatório",
  }),
  payload: z.string().min(2, "Payload é obrigatório").refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "O payload deve ser um JSON válido" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const WebhookTemplateForm = ({
  onTemplateCreated,
  initialValues,
  templateId,
  isEditing = false,
}: WebhookTemplateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    url: initialValues?.url || "",
    targetType: initialValues?.targetType || "opportunity",
    event: initialValues?.event || "create",
    payload: initialValues?.payload || JSON.stringify({ example: "value" }, null, 2),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      let template: WebhookTemplate;

      if (isEditing && templateId) {
        // Update existing template
        const updated = await webhookTemplateAPI.update(templateId, values as WebhookTemplateFormData);
        if (!updated) {
          toast.error("Erro ao atualizar modelo");
          return;
        }
        template = updated;
        toast.success("Modelo atualizado com sucesso");
      } else {
        // Create new template
        template = await webhookTemplateAPI.create(values as WebhookTemplateFormData);
        toast.success("Modelo criado com sucesso");
        form.reset(defaultValues);
      }

      if (onTemplateCreated) {
        onTemplateCreated(template);
      }
    } catch (error) {
      console.error("Error saving webhook template:", error);
      toast.error("Erro ao salvar modelo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatJson = () => {
    try {
      const currentValue = form.getValues("payload");
      const parsedJson = JSON.parse(currentValue);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      form.setValue("payload", formattedJson);
    } catch (e) {
      // Do nothing if the JSON is invalid
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Notificar CRM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Webhook</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemplo.com/webhook" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a finalidade deste modelo de webhook"
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="targetType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Recurso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o recurso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="funnel">Funil</SelectItem>
                    <SelectItem value="stage">Etapa</SelectItem>
                    <SelectItem value="opportunity">Oportunidade</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="move">Movimentação</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="payload"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Payload (JSON)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={formatJson}
                >
                  Formatar JSON
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder='{
  "exemplo": "valor",
  "dados": {
    "campo": "valor"
  }
}'
                  {...field}
                  className="font-mono h-64"
                  spellCheck="false"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Atualizando..."
                : "Salvando..."
              : isEditing
              ? "Atualizar Modelo"
              : "Salvar Modelo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WebhookTemplateForm;
