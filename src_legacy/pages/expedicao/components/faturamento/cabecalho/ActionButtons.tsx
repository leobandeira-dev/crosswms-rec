
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Repeat } from 'lucide-react';

interface ActionButtonsProps {
  onSave: () => void;
  onRatear: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onSave, onRatear }) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button onClick={onSave} className="flex-1 flex items-center gap-2" size="lg">
        <Calculator className="h-4 w-4" />
        Atualizar Cálculos
      </Button>
      
      <Button onClick={onRatear} className="flex-1 flex items-center gap-2" size="lg" variant="secondary">
        <Repeat className="h-4 w-4" />
        Ratear Valores
      </Button>
    </div>
  );
};

export default ActionButtons;
