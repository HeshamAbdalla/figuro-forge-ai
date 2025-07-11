import React, { ReactNode, forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SlideButtonProps extends Omit<ButtonProps, 'variant'> {
  children?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  loadingContent?: ReactNode;
  icon?: ReactNode;
  direction?: 'left' | 'right';
  variant?: 'primary' | 'secondary' | 'outline' | 'default' | 'destructive' | 'ghost' | 'link';
}

const SlideButton = forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ 
    children, 
    isLoading = false, 
    loadingText = "Processing...", 
    loadingContent,
    icon, 
    direction = 'right',
    variant = 'default',
    className, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    
    const variantStyles = {
      primary: "bg-figuro-accent hover:bg-figuro-accent-hover text-white border-figuro-accent",
      secondary: "bg-white/10 hover:bg-white/20 text-white border-white/20",
      outline: "bg-transparent hover:bg-white/10 text-white border-white/20",
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden group transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Background slide effect */}
        <motion.div
          className={cn(
            "absolute inset-0 transition-transform duration-300",
            variant === 'primary' ? "bg-figuro-accent-hover" : "bg-white/30",
            direction === 'right' ? "-translate-x-full group-hover:translate-x-0" : "translate-x-full group-hover:translate-x-0"
          )}
          initial={false}
          animate={isDisabled ? {} : {}}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4"
              >
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              </motion.div>
              {loadingText}
            </>
          ) : (
            <>
              {icon && direction === 'left' && (
                <motion.span
                  className="flex-shrink-0"
                  initial={false}
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.span>
              )}
              
              <span className="font-medium">{children}</span>
              
              {icon && direction === 'right' && (
                <motion.span
                  className="flex-shrink-0"
                  initial={false}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.span>
              )}
            </>
          )}
        </span>
      </Button>
    );
  }
)

SlideButton.displayName = "SlideButton"

export { SlideButton }