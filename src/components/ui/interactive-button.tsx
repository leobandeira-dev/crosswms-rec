import { forwardRef, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Check } from 'lucide-react';

interface InteractiveButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  ripple?: boolean;
  pulse?: boolean;
  bounce?: boolean;
}

const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ 
    children, 
    className, 
    isLoading = false, 
    isSuccess = false,
    loadingText = 'Carregando...',
    successText = 'Concluído!',
    ripple = true,
    pulse = false,
    bounce = false,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const [isClicked, setIsClicked] = useState(false);
    const [rippleStyle, setRippleStyle] = useState({});

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);

      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        setRippleStyle({
          width: size,
          height: size,
          left: x,
          top: y,
        });

        setTimeout(() => setRippleStyle({}), 600);
      }

      onClick?.(e);
    };

    const getContent = () => {
      if (isLoading) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
          </div>
        );
      }
      
      if (isSuccess) {
        return (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successText}
          </div>
        );
      }
      
      return children;
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-200 ease-in-out',
          'hover:scale-105 active:scale-95',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
          pulse && 'animate-pulse',
          bounce && 'hover:animate-bounce',
          isClicked && 'scale-95',
          isSuccess && 'bg-green-600 hover:bg-green-700 border-green-600',
          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {getContent()}
        
        {/* Ripple Effect */}
        {ripple && Object.keys(rippleStyle).length > 0 && (
          <span
            className="absolute bg-white/20 rounded-full animate-ping pointer-events-none"
            style={rippleStyle}
          />
        )}
      </Button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export { InteractiveButton };
export type { InteractiveButtonProps };