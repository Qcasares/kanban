import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { TaskForm } from './TaskForm';
import { ColumnForm } from './ColumnForm';
import { BoardForm } from './BoardForm';
import useKanbanStore, { Board, Column, Task } from '../lib/store/kanban-store';
import { Plus, Settings2 } from 'lucide-react';

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  // State for dialog management
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<{ task: Task; columnId: string } | null>(null);

  // Store actions
  const {
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    deleteColumn,
    updateBoard,
    deleteBoard,
    reorderColumns,
  } = useKanbanStore();

  // Dialog handlers
  const handleAddTask = useCallback((columnId: string) => {
    setActiveColumn(board.columns.find((col) => col.id === columnId) || null);
    setActiveTask(null);
    setTaskDialogOpen(true);
  }, [board.columns]);

  const handleEditTask = useCallback((columnId: string, task: Task) => {
    setActiveColumn(board.columns.find((col) => col.id === columnId) || null);
    setActiveTask({ task, columnId });
    setTaskDialogOpen(true);
  }, [board.columns]);

  const handleAddColumn = useCallback(() => {
    setActiveColumn(null);
    setColumnDialogOpen(true);
  }, []);

  const handleEditColumn = useCallback((column: Column) => {
    setActiveColumn(column);
    setColumnDialogOpen(true);
  }, []);

  const handleEditBoard = useCallback(() => {
    setBoardDialogOpen(true);
  }, []);

  // Form submission handlers
  const handleTaskSubmit = useCallback((formData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!activeColumn) return;

    if (activeTask) {
      // Update existing task
      updateTask(board.id, activeTask.columnId, {
        ...activeTask.task,
        ...formData,
      });
    } else {
      // Create new task
      addTask(
        board.id,
        activeColumn.id,
        formData.title,
        formData.description,
        formData.priority,
        formData.dueDate,
        formData.tags
      );
    }

    setTaskDialogOpen(false);
  }, [activeColumn, activeTask, board.id, addTask, updateTask]);

  const handleTaskDelete = useCallback(() => {
    if (activeTask) {
      deleteTask(board.id, activeTask.columnId, activeTask.task.id);
      setTaskDialogOpen(false);
    }
  }, [activeTask, board.id, deleteTask]);

  const handleColumnSubmit = useCallback((formData: { title: string; color?: string }) => {
    if (activeColumn) {
      // Update existing column
      updateColumn(board.id, activeColumn.id, formData.title, formData.color);
    } else {
      // Create new column
      addColumn(board.id, formData.title, formData.color);
    }

    setColumnDialogOpen(false);
  }, [activeColumn, board.id, addColumn, updateColumn]);

  const handleColumnDelete = useCallback(() => {
    if (activeColumn) {
      deleteColumn(board.id, activeColumn.id);
      setColumnDialogOpen(false);
    }
  }, [activeColumn, board.id, deleteColumn]);

  const handleBoardSubmit = useCallback((formData: { title: string }) => {
    updateBoard(board.id, formData.title);
    setBoardDialogOpen(false);
  }, [board.id, updateBoard]);

  const handleBoardDelete = useCallback(() => {
    deleteBoard(board.id);
    setBoardDialogOpen(false);
  }, [board.id, deleteBoard]);

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Optional: Add any state changes needed when drag starts
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: Handle hover states
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;
    
    // Find the source column (where the task is from)
    const sourceColumnId = board.columns.find((column) =>
      column.tasks.some((task) => task.id === activeId)
    )?.id;
    
    if (!sourceColumnId) return;
    
    // Check if we're dragging to another column
    if (board.columns.some((column) => column.id === overId)) {
      // We're dragging a task to a column - simple move
      moveTask(board.id, sourceColumnId, overId, activeId);
    } else {
      // We're reordering within the same column or moving to another column
      // that already has the task ID as target
      // (this would require more complex handling - we'd need to identify
      // which task is being targeted and its column)
    }
  }, [board, moveTask]);

  // Function to handle column reordering
  const handleColumnReorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    const newColumns = arrayMove(board.columns, sourceIndex, destinationIndex);
    reorderColumns(board.id, newColumns);
  }, [board, reorderColumns]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddColumn}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add Column
          </Button>
          <Button
            onClick={handleEditBoard}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Settings2 size={16} />
            Board Settings
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={column.tasks}
                onAddTask={() => handleAddTask(column.id)}
                onEditTask={(task) => handleEditTask(column.id, task)}
                onEditColumn={() => handleEditColumn(column)}
              />
            ))}
          </div>
        </DndContext>
      </main>
      
      {/* Task Dialog */}
      <Dialog
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        title={activeTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          initialTask={activeTask?.task}
          onSubmit={handleTaskSubmit}
          onCancel={() => setTaskDialogOpen(false)}
        />
        {activeTask && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleTaskDelete}
              className="w-full"
            >
              Delete Task
            </Button>
          </div>
        )}
      </Dialog>
      
      {/* Column Dialog */}
      <Dialog
        isOpen={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        title={activeColumn ? "Edit Column" : "Create New Column"}
      >
        <ColumnForm
          initialColumn={activeColumn || undefined}
          onSubmit={handleColumnSubmit}
          onCancel={() => setColumnDialogOpen(false)}
          onDelete={activeColumn ? handleColumnDelete : undefined}
        />
      </Dialog>
      
      {/* Board Dialog */}
      <Dialog
        isOpen={boardDialogOpen}
        onClose={() => setBoardDialogOpen(false)}
        title="Board Settings"
      >
        <BoardForm
          initialBoard={board}
          onSubmit={handleBoardSubmit}
          onCancel={() => setBoardDialogOpen(false)}
          onDelete={handleBoardDelete}
        />
      </Dialog>
    </div>
  );
}
