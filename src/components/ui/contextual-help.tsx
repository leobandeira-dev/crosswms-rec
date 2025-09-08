import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ContextualHelpProps {
  title: string;
  content: string | React.ReactNode;
  examples?: string[];
  variant?: 'popover' | 'dialog';
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  examples = [],
  variant = 'popover',
  className = ''
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const helpContent = (
    <div className="space-y-3">
      <div className="text-sm text-gray-700">
        {typeof content === 'string' ? (
          <p>{content}</p>
        ) : (
          content
        )}
      </div>
      
      {examples.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Exemplos:</h4>
          <ul className="space-y-1">
            {examples.map((example, index) => (
              <li key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (variant === 'dialog') {
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowDialog(true)}
          className={`h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${className}`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                {title}
              </DialogTitle>
            </DialogHeader>
            {helpContent}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${className}`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            {title}
          </h4>
          {helpContent}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Componente específico para campos de formulário
interface FormFieldHelpProps {
  fieldName: string;
  description: string;
  examples?: string[];
  tips?: string[];
  variant?: 'popover' | 'dialog';
}

export const FormFieldHelp: React.FC<FormFieldHelpProps> = ({
  fieldName,
  description,
  examples = [],
  tips = [],
  variant = 'popover'
}) => {
  const content = (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">{description}</p>
      
      {examples.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-1">Exemplos:</h5>
          <div className="space-y-1">
            {examples.map((example, index) => (
              <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <code className="text-blue-800">{example}</code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tips.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-1">Dicas:</h5>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-green-600 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <ContextualHelp
      title={`Ajuda: ${fieldName}`}
      content={content}
      variant={variant}
    />
  );
};

export default ContextualHelp;