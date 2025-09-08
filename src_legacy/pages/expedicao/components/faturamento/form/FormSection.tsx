
import React, { ReactNode } from 'react';

interface FormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  collapsible?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className,
  description,
  collapsible = false
}) => {
  return (
    <div className={`border rounded-md p-4 ${className}`}>
      {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      {children}
    </div>
  );
};

export default FormSection;
