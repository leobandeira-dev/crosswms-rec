import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  interactive?: 'micro' | 'ripple' | 'magnetic' | 'glow' | 'press' | 'morph';
  children: React.ReactNode;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  success = false,
  error = false,
  interactive = 'micro',
  children,
  disabled,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    
    if (props.onClick && !disabled && !loading) {
      props.onClick(e);
    }
  };

  const getInteractiveClasses = () => {
    const classes = [];
    
    switch (interactive) {
      case 'micro':
        classes.push('btn-micro');
        break;
      case 'ripple':
        classes.push('btn-micro', 'btn-ripple');
        break;
      case 'magnetic':
        classes.push('btn-magnetic');
        break;
      case 'glow':
        classes.push('btn-glow');
        break;
      case 'press':
        classes.push('btn-press');
        break;
      case 'morph':
        classes.push('btn-morph');
        break;
    }

    if (isClicked) {
      classes.push('scale-click');
    }

    if (loading) {
      classes.push('btn-loading');
    }

    if (success && interactive === 'morph') {
      classes.push('success');
    }

    if (error && interactive === 'morph') {
      classes.push('error');
    }

    return classes.join(' ');
  };

  return (
    <Button
      className={cn(
        getInteractiveClasses(),
        'color-transition focus-trap',
        className
      )}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      {...props}
      onClick={handleClick}
    >
      {loading ? (
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : success ? (
        '✓'
      ) : error ? (
        '✕'
      ) : (
        children
      )}
    </Button>
  );
};

export default EnhancedButton;