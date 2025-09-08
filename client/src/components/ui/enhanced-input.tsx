import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  validating?: boolean;
  interactive?: boolean;
  floatingLabel?: boolean;
  glowEffect?: boolean;
  validationStates?: boolean;
  withMicroAnimations?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    label,
    error,
    success = false,
    loading = false,
    validating = false,
    interactive = true,
    floatingLabel = false,
    glowEffect = false,
    validationStates = true,
    withMicroAnimations = true,
    className,
    onFocus,
    onBlur,
    onChange,
    onValidationChange,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = ref || internalRef;

    useEffect(() => {
      if (validating) {
        setIsValidating(true);
        const timer = setTimeout(() => setIsValidating(false), 1000);
        return () => clearTimeout(timer);
      }
    }, [validating]);

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(!error && success);
      }
    }, [error, success, onValidationChange]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      if (onChange) onChange(e);
    };

    const getValidationClasses = () => {
      const classes = [];
      
      if (withMicroAnimations) {
        if (interactive) {
          classes.push('input-micro');
        }
        
        if (glowEffect) {
          classes.push('input-glow');
        }
        
        classes.push('color-transition', 'focus-trap');
      }
      
      if (validationStates) {
        classes.push('form-field');
        
        if (error) {
          classes.push('invalid', 'field-error');
        } else if (success) {
          classes.push('valid');
        } else if (isValidating || loading) {
          classes.push('validating');
        }
      }
      
      return classes.join(' ');
    };

    const inputElement = (
      <Input
        ref={inputRef}
        className={cn(
          getValidationClasses(),
          error && 'border-red-500 animate-pulse',
          success && 'border-green-500',
          isFocused && 'ring-2 ring-blue-500 ring-opacity-50',
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
    );

    if (floatingLabel && label) {
      return (
        <div className="floating-label relative">
          {inputElement}
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none',
              'bg-white px-1 text-gray-500 z-10',
              (isFocused || hasValue || props.value || props.defaultValue) 
                ? 'top-0 text-xs text-blue-500 transform -translate-y-1/2' 
                : 'top-1/2 transform -translate-y-1/2'
            )}
          >
            {label}
          </label>
          {error && (
            <div className="mt-1 text-sm text-red-500 slide-up field-error">
              {error}
            </div>
          )}
          {success && !error && (
            <div className="mt-1 text-sm text-green-500 fade-in">
              Campo validado com sucesso
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative space-y-2">
        {label && !floatingLabel && (
          <label className="block text-sm font-medium text-gray-700 color-transition">
            {label}
          </label>
        )}
        
        <div className="relative">
          {inputElement}
          
          {/* Loading spinner overlay */}
          {(isValidating || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animation-spin"></div>
            </div>
          )}
          
          {/* Success checkmark */}
          {success && !isValidating && !loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 bounce-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Error X mark */}
          {error && !isValidating && !loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 bounce-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="toast-error text-sm p-2 rounded-md text-white">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {success && !error && (
          <div className="toast-success text-sm p-2 rounded-md text-white">
            Campo validado com sucesso!
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };