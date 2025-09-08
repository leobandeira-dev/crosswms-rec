
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onReset: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  resetLabel?: string;
  cancelLabel?: string;
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  onReset,
  onCancel,
  isSubmitting = false,
  submitLabel = "Adicionar Nota Fiscal",
  resetLabel = "Limpar",
  cancelLabel = "Cancelar",
  className = ""
}) => {
  return (
    <div className={`flex justify-end space-x-2 ${className}`}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
      <Button type="button" variant="outline" onClick={onReset}>{resetLabel}</Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;
