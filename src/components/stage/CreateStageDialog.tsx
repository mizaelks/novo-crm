
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stage } from "@/types";
import { stageAPI } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CreateStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funnelId: string;
  onStageCreated: (stage: Stage) => void;
}

const CreateStageDialog = ({ 
  open, 
  onOpenChange, 
  funnelId, 
  onStageCreated 
}: CreateStageDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the new stage
      const newStage = await stageAPI.create({
        name: values.name,
        description: values.description || "",
        funnelId
      });
      
      // Show success notification
      toast.success("Etapa criada com sucesso!");
      
      // Explicitly ensure the stage has the required properties before calling the callback
      const completeStage: Stage = {
        ...newStage,
        id: newStage.id,
        name: newStage.name,
        description: newStage.description,
        order: newStage.order,
        funnelId: newStage.funnelId,
        opportunities: []
      };
      
      // Call the callback with the complete stage
      onStageCreated(completeStage);
      
      // Reset the form
      form.reset();
      onOpenChange(false); // Close the dialog after successful creation
    } catch (error) {
      console.error("Error creating stage:", error);
      toast.error("Erro ao criar etapa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar nova etapa</DialogTitle>
          <DialogDescription>
            Adicione uma nova etapa ao seu funil de vendas.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da etapa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Qualificação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito desta etapa" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar etapa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStageDialog;
