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
    <div className="flex items-center justify-between w-full p-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-background/0 to-secondary/5">
      <div className="flex items-center">
        <Layout className="mr-2 h-5 w-5 text-primary" />
        <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Boards</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <select
            value={activeBoard || ''}
            onChange={(e) => setActiveBoard(e.target.value)}
            className="bg-background/80 text-foreground rounded-full border border-primary/20 h-9 pl-4 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none backdrop-blur-sm transition-all"
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1 rounded-full bg-primary hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          New Board
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