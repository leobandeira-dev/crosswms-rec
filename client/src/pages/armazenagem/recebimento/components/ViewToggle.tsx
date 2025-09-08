
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Kanban } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={viewMode === 'list' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setViewMode('list')}
        className="flex items-center gap-1"
      >
        <List className="h-4 w-4" />
        Lista
      </Button>
      <Button 
        variant={viewMode === 'kanban' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setViewMode('kanban')}
        className="flex items-center gap-1"
      >
        <Kanban className="h-4 w-4" />
        Kanban
      </Button>
    </div>
  );
};

export default ViewToggle;
