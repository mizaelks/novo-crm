
declare module 'react-beautiful-dnd' {
  import * as React from 'react';
  
  // Basic types
  export type DraggableId = string;
  export type DroppableId = string;
  export type DraggableLocation = {
    droppableId: DroppableId;
    index: number;
  };
  
  export type DropResult = {
    draggableId: DraggableId;
    type: string;
    source: DraggableLocation;
    destination?: DraggableLocation;
    reason: 'DROP' | 'CANCEL';
  };
  
  // Components
  export const DragDropContext: React.ComponentType<{
    onDragEnd: (result: DropResult) => void;
    children: React.ReactNode;
  }>;
  
  export const Droppable: React.ComponentType<{
    droppableId: string;
    type?: string;
    direction?: 'horizontal' | 'vertical';
    children: (provided: any, snapshot: any) => React.ReactNode;
  }>;
  
  export const Draggable: React.ComponentType<{
    draggableId: string;
    index: number;
    children: (provided: any, snapshot: any) => React.ReactNode;
  }>;
}
