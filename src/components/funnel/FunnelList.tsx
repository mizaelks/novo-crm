
import { useState, useEffect } from "react";
import { Funnel } from "@/types";
import { funnelAPI } from "@/services/api";
import FunnelCard from "./FunnelCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateFunnelDialog from "./CreateFunnelDialog";

const FunnelList = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const loadFunnels = async () => {
      try {
        const data = await funnelAPI.getAll();
        setFunnels(data);
      } catch (error) {
        console.error("Error loading funnels:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnels();
  }, []);

  const handleFunnelCreated = (newFunnel: Funnel) => {
    setFunnels([...funnels, newFunnel]);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Funis de Venda</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Funil
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funnels.map((funnel) => (
            <FunnelCard key={funnel.id} funnel={funnel} />
          ))}
          {funnels.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">Nenhum funil encontrado</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro funil
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateFunnelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onFunnelCreated={handleFunnelCreated}
      />
    </div>
  );
};

export default FunnelList;
