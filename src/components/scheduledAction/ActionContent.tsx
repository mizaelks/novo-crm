
import { ScheduledAction } from "@/types";
import { format } from "date-fns";

interface ActionContentProps {
  action: ScheduledAction;
}

export const ActionContent = ({ action }: ActionContentProps) => {
  if (action.actionType === 'webhook' && action.actionConfig) {
    return (
      <div className="text-sm">
        <p><strong>URL:</strong> {action.actionConfig.url}</p>
        {action.actionConfig.method && (
          <p><strong>Método:</strong> {action.actionConfig.method}</p>
        )}
        {action.actionConfig.response && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Resposta:</strong> {action.actionConfig.response.status || "-"}</p>
            {action.actionConfig.response.executed_at && (
              <p><strong>Executado em:</strong> {format(new Date(action.actionConfig.response.executed_at), "dd/MM/yyyy HH:mm:ss")}</p>
            )}
            {action.actionConfig.response.error && (
              <p><strong>Erro:</strong> {action.actionConfig.response.error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return null;
};
