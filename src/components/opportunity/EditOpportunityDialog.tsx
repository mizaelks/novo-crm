
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Opportunity } from "@/types";
import { opportunityAPI } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  client: z.string().min(2, "Nome do cliente é obrigatório"),
  value: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

interface EditOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const EditOpportunityDialog = ({
  open,
  onOpenChange,
  opportunityId,
  onOpportunityUpdated
}: EditOpportunityDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      client: "",
      value: 0,
      company: "",
      phone: "",
      email: ""
    }
  });

  useEffect(() => {
    const loadOpportunity = async () => {
      if (open && opportunityId) {
        setIsLoading(true);
        try {
          const opportunity = await opportunityAPI.getById(opportunityId);
          if (opportunity) {
            form.reset({
              title: opportunity.title,
              client: opportunity.client,
              value: opportunity.value,
              company: opportunity.company || "",
              phone: opportunity.phone || "",
              email: opportunity.email || ""
            });
          }
        } catch (error) {
          console.error("Error loading opportunity:", error);
          toast.error("Erro ao carregar detalhes da oportunidade");
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadOpportunity();
  }, [open, opportunityId, form, onOpenChange]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const updatedOpportunity = await opportunityAPI.update(opportunityId, {
        title: values.title,
        client: values.client,
        value: values.value,
        company: values.company || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined
      });
      
      if (updatedOpportunity) {
        toast.success("Oportunidade atualizada com sucesso!");
        onOpportunityUpdated(updatedOpportunity);
        onOpenChange(false);
      } else {
        throw new Error("Não foi possível atualizar a oportunidade");
      }
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Erro ao atualizar oportunidade. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pr-8">
          <DialogTitle>Editar oportunidade</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da oportunidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Implementação CRM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Empresa ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 98765-4321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="100"
                      placeholder="0.00" 
                      {...field} 
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
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOpportunityDialog;
