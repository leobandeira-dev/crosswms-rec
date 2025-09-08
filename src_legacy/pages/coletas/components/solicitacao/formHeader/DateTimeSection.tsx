
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateSectionProps } from './types';

const DateTimeSection: React.FC<DateSectionProps> = ({
  dataLabel,
  horaLabel,
  data,
  hora,
  readonly = false,
  onDataChange,
  onHoraChange,
  id
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label htmlFor={`${id}-data`}>{dataLabel}</Label>
        <Input 
          id={`${id}-data`} 
          type="date" 
          value={data}
          onChange={(e) => onDataChange && onDataChange(e.target.value)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-hora`}>{horaLabel}</Label>
        <Input 
          id={`${id}-hora`} 
          type="time" 
          value={hora}
          onChange={(e) => onHoraChange && onHoraChange(e.target.value)}
          readOnly={readonly}
          className={readonly ? "bg-gray-50" : ""}
        />
      </div>
    </div>
  );
};

export default DateTimeSection;
