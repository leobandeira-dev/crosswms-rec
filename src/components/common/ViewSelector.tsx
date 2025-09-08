import { Button } from '@/components/ui/button';
import { Grid3X3, List, Kanban, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ViewSelectorProps {
  currentView: 'cards' | 'list' | 'kanban';
  onViewChange: (view: 'cards' | 'list' | 'kanban') => void;
  showBackButton?: boolean;
}

export const ViewSelector = ({ 
  currentView, 
  onViewChange, 
  showBackButton = true 
}: ViewSelectorProps) => {
  const [, setLocation] = useLocation();

  const handleBackToWorkflow = () => {
    setLocation('/coletas');
  };

  return (
    <div className="flex items-center gap-2">
      {showBackButton && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToWorkflow}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Workflow
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
        </>
      )}
      
      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Button
          variant={currentView === 'cards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('cards')}
          className="h-8 px-3"
          title="Visualização em Cards"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className="h-8 px-3"
          title="Visualização em Lista"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={currentView === 'kanban' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('kanban')}
          className="h-8 px-3"
          title="Visualização Kanban"
        >
          <Kanban className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};