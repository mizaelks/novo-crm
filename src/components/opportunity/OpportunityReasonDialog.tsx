
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Opportunity, Stage } from "@/types";
import { opportunityAPI } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  winReason: z.string().optional(),
  lossReason: z.string().optional(),
}).refine(data => {
  // At least one reason must be provided if both are available
  return data.winReason || data.lossReason;
}, {
  message: "Pelo menos um motivo deve ser selecionado",
  path: ["winReason"]
});

type FormValues = z.infer<typeof formSchema>;

interface OpportunityReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
  stage: Stage;
  onComplete: (success: boolean, updatedOpportunity?: Opportunity) => void;
}

const OpportunityReasonDialog = ({
  open,
  onOpenChange,
  opportunity,
  stage,
  onComplete
}: OpportunityReasonDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsWinReason = stage.isWinStage && stage.winReasonRequired;
  const needsLossReason = stage.isLossStage && stage.lossReasonRequired;
  const availableWinReasons = stage.winReasons || [];
  const availableLossReasons = stage.lossReasons || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      winReason: opportunity.winReason || "",
      lossReason: opportunity.lossReason || ""
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const updateData: Partial<Opportunity> = {};
      
      if (needsWinReason && values.winReason) {
        updateData.winReason = values.winReason;
      }
      
      if (needsLossReason && values.lossReason) {
        updateData.lossReason = values.lossReason;
      }
      
      // Create the updated opportunity object
      const updatedOpportunity = {
        ...opportunity,
        ...updateData
      };
      
      toast.success("Motivo adicionado com sucesso!");
      onComplete(true, updatedOpportunity);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating opportunity reasons:", error);
      toast.error("Erro ao adicionar motivo. Tente novamente.");
      onComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Motivo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {needsWinReason && (
              <FormField
                control={form.control}
                name="winReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de Vitória *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo de vitória" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableWinReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {needsLossReason && (
              <FormField
                control={form.control}
                name="lossReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de Perda *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo de perda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableLossReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityReasonDialog;
