import { forwardRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface InteractiveCheckboxProps {
  label?: string;
  description?: string;
  animateCheck?: boolean;
  pulseOnCheck?: boolean;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const InteractiveCheckbox = forwardRef<
  React.ElementRef<typeof Checkbox>,
  InteractiveCheckboxProps
>(({ 
  className,
  label,
  description,
  animateCheck = true,
  pulseOnCheck = true,
  checked,
  onCheckedChange,
  ...props 
}, ref) => {
  const handleChange = (value: boolean) => {
    onCheckedChange?.(value);
  };

  return (
    <div className="flex items-start space-x-3 group">
      <Checkbox
        ref={ref}
        className={cn(
          'transition-all duration-200 ease-in-out',
          'hover:scale-110 active:scale-95',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
          animateCheck && checked && 'animate-pulse',
          pulseOnCheck && checked && 'shadow-md shadow-primary/20',
          'data-[state=checked]:animate-in data-[state=checked]:zoom-in-75',
          className
        )}
        checked={checked}
        onCheckedChange={handleChange}
        {...props}
      />
      
      {(label || description) && (
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                'cursor-pointer select-none transition-colors duration-200',
                'group-hover:text-primary'
              )}
              onClick={() => handleChange(!checked)}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

InteractiveCheckbox.displayName = 'InteractiveCheckbox';

export { InteractiveCheckbox };
export type { InteractiveCheckboxProps };