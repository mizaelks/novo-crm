
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => () => {});

  const showConfirmation = (dialogTitle: string, dialogDescription: string): Promise<boolean> => {
    setTitle(dialogTitle);
    setDescription(dialogDescription);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    resolver(true);
    setIsOpen(false);
    setIsConfirming(false);
  };

  const handleCancel = () => {
    resolver(false);
    setIsOpen(false);
  };

  const ConfirmDialog = () => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    showConfirmation,
    ConfirmDialog
  };
}
