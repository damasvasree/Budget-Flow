import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabProps {
  onClick: () => void;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50',
        'h-14 w-14 rounded-full bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl transition-all',
        'flex items-center justify-center',
        'active:scale-95 hover:scale-105',
        'animate-scale-in',
        className
      )}
      aria-label="Add transaction"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
