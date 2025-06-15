
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LazyKanbanBoard } from "@/components/lazy/LazyKanbanBoard";
import { toast } from "sonner";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FunnelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<Funnel | null>(null);

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
    <div className="space-y-4 pb-6">
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
            
            <h1 className="text-xl font-semibold hidden md:block">
              {funnel?.name}
            </h1>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <LazyKanbanBoard funnelId={id!} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FunnelDetail;
