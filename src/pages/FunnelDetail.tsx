
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { toast } from "sonner";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FunnelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const checkFunnelExists = async () => {
      if (!id) {
        toast.error("ID do funil não fornecido");
        navigate("/funnels");
        return;
      }

      try {
        setLoading(true);
        const funnel = await funnelAPI.getById(id);
        
        if (!funnel) {
          toast.error("Funil não encontrado");
          navigate("/funnels");
          return;
        }

        setFunnel(funnel);
      } catch (error) {
        console.error("Error checking funnel:", error);
        toast.error("Erro ao carregar o funil");
        navigate("/funnels");
      } finally {
        setLoading(false);
      }
    };

    checkFunnelExists();
  }, [id, navigate]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[calc(100vh-200px)] w-full" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/funnels")}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para funis
            </Button>
          </div>
          
          {showInfo && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Campos obrigatórios por etapa</AlertTitle>
              <AlertDescription>
                Você pode configurar campos obrigatórios para cada etapa do funil. Ao editar uma etapa, 
                é possível adicionar campos que devem ser preenchidos antes que uma oportunidade possa 
                ser movida para esta etapa.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowInfo(false)}
              >
                Entendi
              </Button>
            </Alert>
          )}
          
          <KanbanBoard funnelId={id!} />
        </>
      )}
    </div>
  );
};

export default FunnelDetail;
