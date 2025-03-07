import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { TaskForm } from './TaskForm';
import { ColumnForm } from './ColumnForm';
import { BoardForm } from './BoardForm';
import useKanbanStore, { Board, Column, Task } from '../lib/store/kanban-store';
import { Plus, Settings2, Layout } from 'lucide-react';

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
  const handleDragStart = useCallback(() => {
    // Optional: Add any state changes needed when drag starts
  }, []);

  const handleDragOver = useCallback(() => {
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


  return (
    <div className="h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-primary/10 backdrop-blur-sm bg-background/50">
        <h1 className="text-2xl font-bold text-primary">{board.title}</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleAddColumn}
            size="sm"
            className="flex items-center gap-1 rounded-full"
            variant="default"
          >
            <Plus size={16} />
            Add Column
          </Button>
          <Button
            onClick={handleEditBoard}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 rounded-full"
          >
            <Settings2 size={16} />
            Board Settings
          </Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-muted/20">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4">
            {board.columns.length > 0 ? (
              board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={column.tasks}
                  onAddTask={() => handleAddTask(column.id)}
                  onEditTask={(task) => handleEditTask(column.id, task)}
                  onEditColumn={() => handleEditColumn(column)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-6 animate-in">
                <div className="glassmorphism p-8 rounded-xl text-center max-w-md mx-auto">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-primary opacity-70" />
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No columns yet</h3>
                  <p className="text-muted-foreground mb-6">Get started by creating your first column to organize your tasks</p>
                  <Button
                    onClick={handleAddColumn}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Column
                  </Button>
                </div>
              </div>
            )}
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
