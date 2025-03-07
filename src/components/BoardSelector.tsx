import React, { useState } from 'react';
import useKanbanStore from '../lib/store/kanban-store';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { BoardForm } from './BoardForm';
import { Plus, Layout } from 'lucide-react';

export function BoardSelector() {
  const { boards, activeBoard, setActiveBoard, createBoard } = useKanbanStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateBoard = (data: { title: string }) => {
    createBoard(data.title);
    setDialogOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full p-2 border-b">
      <div className="flex items-center">
        <Layout className="mr-2 h-5 w-5 text-primary" />
        <span className="font-medium">Boards</span>
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={activeBoard || ''}
          onChange={(e) => setActiveBoard(e.target.value)}
          className="bg-background text-foreground rounded-md border border-input h-9 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={boards.length === 0}
        >
          {boards.length === 0 ? (
            <option value="">No boards</option>
          ) : (
            boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))
          )}
        </select>
        
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          New
        </Button>
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create New Board"
      >
        <BoardForm
          onSubmit={handleCreateBoard}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
}