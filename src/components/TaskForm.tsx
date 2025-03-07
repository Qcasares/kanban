import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Task } from '../lib/store/kanban-store';

interface TaskFormProps {
  initialTask?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState<string>(
    initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
  );
  const [tags, setTags] = useState(initialTask?.tags.join(', ') || '');
  const [errors, setErrors] = useState({
    title: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      title: title.trim() ? '' : 'Title is required',
    };
    
    setErrors(newErrors);
    
    if (newErrors.title) {
      return;
    }
    
    // Process form data
    const formData: Omit<Task, 'id' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    };
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Task title"
        autoFocus
      />
      
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the task..."
        rows={4}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
        
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      
      <Input
        label="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="feature, bug, documentation"
      />
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {initialTask ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}