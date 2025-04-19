
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { toast } from "sonner";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";

const FunnelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [funnelExists, setFunnelExists] = useState(false);

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

        setFunnelExists(true);
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

  if (loading) {
    return <div className="flex justify-center py-8">Carregando funil...</div>;
  }

  if (!id || !funnelExists) {
    return null; // Navigation handled in useEffect
  }

  return (
    <div className="space-y-6">
      <KanbanBoard funnelId={id} />
    </div>
  );
};

export default FunnelDetail;
