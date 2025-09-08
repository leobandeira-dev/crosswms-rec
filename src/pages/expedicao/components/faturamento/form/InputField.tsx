
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface InputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  step?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  form, 
  name, 
  label, 
  placeholder = "", 
  type = "text", 
  step,
  className
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              type={type} 
              step={step} 
              {...field} 
              value={field.value ?? (type === 'number' ? '0' : '')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InputField;
