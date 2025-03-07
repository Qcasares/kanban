import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Column } from '../lib/store/kanban-store';

interface ColumnFormProps {
  initialColumn?: Column;
  onSubmit: (column: { title: string; color?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ColumnForm({ initialColumn, onSubmit, onCancel, onDelete }: ColumnFormProps) {
  const [title, setTitle] = useState(initialColumn?.title || '');
  const [color, setColor] = useState(initialColumn?.color || '#3498db');
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
    
    onSubmit({ title: title.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Column title"
        autoFocus
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Column Color
        </label>
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 p-1"
          />
          <div 
            className="h-10 flex-1 rounded-md border"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      
      <div className={`flex ${initialColumn ? 'justify-between' : 'justify-end'} pt-2`}>
        {initialColumn && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete Column
          </Button>
        )}
        
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialColumn ? 'Update Column' : 'Create Column'}
          </Button>
        </div>
      </div>
    </form>
  );
}