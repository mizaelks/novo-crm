
import { useParams } from "react-router-dom";
import KanbanBoard from "@/components/kanban/KanbanBoard";

const FunnelDetail = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="text-center py-8">ID do funil não fornecido</div>;
  }

  return (
    <div className="space-y-6">
      <KanbanBoard funnelId={id} />
    </div>
  );
};

export default FunnelDetail;
