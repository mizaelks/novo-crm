
interface EntityReferenceListProps {
  funnels: Array<{id: string, name: string}>;
  stages: Array<{id: string, name: string, funnelId: string}>;
}

export const EntityReferenceList = ({ funnels, stages }: EntityReferenceListProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Funis:</h4>
        <ul className="space-y-1 text-sm">
          {funnels.map(funnel => (
            <li key={funnel.id} className="grid grid-cols-2">
              <span className="font-mono">{funnel.id}</span>
              <span>{funnel.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Etapas:</h4>
        <ul className="space-y-1 text-sm">
          {stages.map(stage => (
            <li key={stage.id} className="grid grid-cols-3">
              <span className="font-mono">{stage.id}</span>
              <span>{stage.name}</span>
              <span className="text-muted-foreground text-xs">Funil: {
                funnels.find(f => f.id === stage.funnelId)?.name || stage.funnelId
              }</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
