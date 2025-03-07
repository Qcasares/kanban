import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
  tags: string[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export interface KanbanState {
  boards: Board[];
  activeBoard: string | null;
  
  // Board actions
  createBoard: (title: string) => void;
  updateBoard: (id: string, title: string) => void;
  deleteBoard: (id: string) => void;
  setActiveBoard: (id: string) => void;
  
  // Column actions
  addColumn: (boardId: string, title: string, color?: string) => void;
  updateColumn: (boardId: string, columnId: string, title: string, color?: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, columns: Column[]) => void;
  
  // Task actions
  addTask: (
    boardId: string,
    columnId: string,
    title: string,
    description: string,
    priority: Task['priority'],
    dueDate?: Date,
    tags?: string[]
  ) => void;
  updateTask: (boardId: string, columnId: string, task: Task) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
  moveTask: (
    boardId: string, 
    sourceColumnId: string, 
    destinationColumnId: string, 
    taskId: string
  ) => void;
}

const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      boards: [],
      activeBoard: null,
      
      // Board actions
      createBoard: (title) => 
        set((state) => {
          const newBoard: Board = {
            id: crypto.randomUUID(),
            title,
            columns: [
              { id: crypto.randomUUID(), title: 'To Do', tasks: [], color: '#3498db' },
              { id: crypto.randomUUID(), title: 'In Progress', tasks: [], color: '#f39c12' },
              { id: crypto.randomUUID(), title: 'Done', tasks: [], color: '#2ecc71' },
            ],
          };
          
          return { 
            boards: [...state.boards, newBoard],
            // Set the newly created board as active if no active board
            activeBoard: state.activeBoard ? state.activeBoard : newBoard.id
          };
        }),
      
      updateBoard: (id, title) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? { ...board, title } : board
          ),
        })),
      
      deleteBoard: (id) =>
        set((state) => {
          const newBoards = state.boards.filter((board) => board.id !== id);
          // If the active board is deleted, set active to the first board or null
          const newActiveBoard = state.activeBoard === id 
            ? (newBoards.length > 0 ? newBoards[0].id : null)
            : state.activeBoard;
            
          return { 
            boards: newBoards,
            activeBoard: newActiveBoard
          };
        }),
      
      setActiveBoard: (id) =>
        set({ activeBoard: id }),
      
      // Column actions
      addColumn: (boardId, title, color) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: [
                    ...board.columns,
                    {
                      id: crypto.randomUUID(),
                      title,
                      tasks: [],
                      color,
                    },
                  ],
                }
              : board
          ),
        })),
      
      updateColumn: (boardId, columnId, title, color) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? { ...column, title, ...(color && { color }) }
                      : column
                  ),
                }
              : board
          ),
        })),
      
      deleteColumn: (boardId, columnId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.filter(
                    (column) => column.id !== columnId
                  ),
                }
              : board
          ),
        })),
      
      reorderColumns: (boardId, columns) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, columns } : board
          ),
        })),
      
      // Task actions
      addTask: (
        boardId, 
        columnId, 
        title, 
        description, 
        priority, 
        dueDate, 
        tags = []
      ) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: [
                            ...column.tasks,
                            {
                              id: crypto.randomUUID(),
                              title,
                              description,
                              priority,
                              createdAt: new Date(),
                              dueDate,
                              tags,
                            },
                          ],
                        }
                      : column
                  ),
                }
              : board
          ),
        })),
      
      updateTask: (boardId, columnId, updatedTask) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.map((task) =>
                            task.id === updatedTask.id ? updatedTask : task
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
        })),
      
      deleteTask: (boardId, columnId, taskId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columns: board.columns.map((column) =>
                    column.id === columnId
                      ? {
                          ...column,
                          tasks: column.tasks.filter(
                            (task) => task.id !== taskId
                          ),
                        }
                      : column
                  ),
                }
              : board
          ),
        })),
      
      moveTask: (boardId, sourceColumnId, destinationColumnId, taskId) =>
        set((state) => {
          // Find the relevant board
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;
          
          // Find the source column and task
          const sourceColumn = board.columns.find((c) => c.id === sourceColumnId);
          if (!sourceColumn) return state;
          
          const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;
          
          // Get the task and remove it from the source
          const task = sourceColumn.tasks[taskIndex];
          
          // If moving to the same column, no need for changes
          if (sourceColumnId === destinationColumnId) return state;
          
          return {
            boards: state.boards.map((b) =>
              b.id === boardId
                ? {
                    ...b,
                    columns: b.columns.map((column) => {
                      // Remove from source column
                      if (column.id === sourceColumnId) {
                        return {
                          ...column,
                          tasks: column.tasks.filter((t) => t.id !== taskId),
                        };
                      }
                      
                      // Add to destination column
                      if (column.id === destinationColumnId) {
                        return {
                          ...column,
                          tasks: [...column.tasks, task],
                        };
                      }
                      
                      return column;
                    }),
                  }
                : b
            ),
          };
        }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);

export default useKanbanStore;