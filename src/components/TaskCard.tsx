import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Task } from '../lib/store/kanban-store';
import { Calendar, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const priorityVariants = {
    low: 'info',
    medium: 'warning',
    high: 'destructive',
  } as const;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="task-card mb-3 cursor-pointer group bg-background glassmorphism backdrop-blur-sm hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
          e.preventDefault();
        }
      }}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
        <div className="flex items-center gap-2 w-full">
          <div className={`w-2 h-2 rounded-full bg-${priorityVariants[task.priority]}`}></div>
          <CardTitle className="text-base font-medium text-foreground">{task.title}</CardTitle>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-3 pt-1 flex flex-wrap gap-2 items-center justify-between border-t border-border/40 mt-1">
        <div className="flex gap-1 flex-wrap">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs bg-secondary/10 hover:bg-secondary/20 transition-colors">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={priorityVariants[task.priority]} 
            className="capitalize text-xs px-2 py-0 h-5"
          >
            {task.priority}
          </Badge>
          
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full" title={task.dueDate.toLocaleDateString()}>
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
