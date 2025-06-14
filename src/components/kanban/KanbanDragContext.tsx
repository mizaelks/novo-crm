
import { createContext, useContext, ReactNode } from 'react';
import { DropResult } from "react-beautiful-dnd";
import { Opportunity, Stage } from "@/types";

interface KanbanDragContextProps {
  handleDragEnd: (result: DropResult) => void;
  stages: Stage[];
}

const KanbanDragContext = createContext<KanbanDragContextProps>({
  handleDragEnd: () => {},
  stages: []
});

export const useKanbanDrag = () => useContext(KanbanDragContext);

interface KanbanDragProviderProps {
  children: ReactNode;
  handleDragEnd: (result: DropResult) => void;
  stages: Stage[];
}

export const KanbanDragProvider = ({ children, handleDragEnd, stages }: KanbanDragProviderProps) => {
  return (
    <KanbanDragContext.Provider value={{ handleDragEnd, stages }}>
      {children}
    </KanbanDragContext.Provider>
  );
};
