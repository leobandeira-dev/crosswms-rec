import { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

interface InteractiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  isInvalid?: boolean;
  isLoading?: boolean;
  validationMessage?: string;
  showValidation?: boolean;
  animateOnFocus?: boolean;
  glowOnFocus?: boolean;
}

const InteractiveInput = forwardRef<HTMLInputElement, InteractiveInputProps>(
  ({ 
    className,
    isValid,
    isInvalid,
    isLoading,
    validationMessage,
    showValidation = true,
    animateOnFocus = true,
    glowOnFocus = true,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setHasInteracted(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const getValidationIcon = () => {
      if (isLoading) {
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      }
      if (isValid && hasInteracted) {
        return <Check className="w-4 h-4 text-green-500" />;
      }
      if (isInvalid && hasInteracted) {
        return <X className="w-4 h-4 text-red-500" />;
      }
      return null;
    };

    const getValidationColor = () => {
      if (isValid && hasInteracted) return 'border-green-500 focus:ring-green-500';
      if (isInvalid && hasInteracted) return 'border-red-500 focus:ring-red-500';
      return 'border-input focus:ring-primary';
    };

    return (
      <div className="relative">
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'transition-all duration-200 ease-in-out pr-10',
              animateOnFocus && isFocused && 'scale-[1.02]',
              glowOnFocus && isFocused && 'shadow-lg',
              getValidationColor(),
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {/* Validation Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        </div>

        {/* Validation Message */}
        {showValidation && validationMessage && hasInteracted && (
          <div className={cn(
            'mt-1 text-sm flex items-center gap-1 transition-all duration-200',
            'animate-in slide-in-from-top-1',
            isValid ? 'text-green-600' : 'text-red-600'
          )}>
            {isInvalid && <AlertCircle className="w-3 h-3" />}
            {isValid && <Check className="w-3 h-3" />}
            {validationMessage}
          </div>
        )}
      </div>
    );
  }
);

InteractiveInput.displayName = 'InteractiveInput';

export { InteractiveInput };
export type { InteractiveInputProps };