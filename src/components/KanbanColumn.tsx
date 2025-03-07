import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task } from '../lib/store/kanban-store';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { PlusIcon, MoreVertical } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onEditColumn: () => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onEditColumn,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  // Create a style with left border based on column color
  const columnStyle = {
    borderLeftColor: column.color || '#cbd5e1',
    borderLeftWidth: '4px',
  };

  return (
    <div
      className="flex flex-col glassmorphism rounded-xl kanban-column
        min-w-[280px] sm:min-w-[300px] max-w-[280px] sm:max-w-[300px] h-full"
      style={columnStyle}
    >
      <div className="flex items-center justify-between p-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium truncate">{column.title}</h3>
          <div className="rounded-full bg-primary/10 text-primary dark:bg-primary/20 w-6 h-6 flex items-center justify-center text-xs font-medium">
            {tasks.length}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10"
            onClick={onAddTask}
            title="Add Task"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10"
            onClick={onEditColumn}
            title="Column Settings"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onEditTask(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center p-6 text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-muted mt-4">
              <PlusIcon className="h-5 w-5 mx-auto mb-2 opacity-50" />
              No tasks yet
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
