import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Board } from '../lib/store/kanban-store';

interface BoardFormProps {
  initialBoard?: Board;
  onSubmit: (board: { title: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function BoardForm({ initialBoard, onSubmit, onCancel, onDelete }: BoardFormProps) {
  const [title, setTitle] = useState(initialBoard?.title || '');
  const [errors, setErrors] = useState({ title: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {
      title: title.trim() ? '' : 'Title is required',
    };
    
    setErrors(newErrors);
    
    if (newErrors.title) {
      return;
    }
    
    onSubmit({ title: title.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Board Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="My Awesome Board"
        autoFocus
      />
      
      <div className={`flex ${initialBoard ? 'justify-between' : 'justify-end'} pt-2`}>
        {initialBoard && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete Board
          </Button>
        )}
        
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialBoard ? 'Update Board' : 'Create Board'}
          </Button>
        </div>
      </div>
    </form>
  );
}