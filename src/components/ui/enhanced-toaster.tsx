
import { useToast } from "@/hooks/use-enhanced-toast";
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport,
  ToastIcon,
  ToastProgress,
  ToastAction
} from "@/components/ui/enhanced-toast";
import { motion, AnimatePresence } from "framer-motion";

export function EnhancedToaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({
          id,
          title,
          description,
          action,
          variant = "default",
          duration = 5000,
          persistent = false,
          showProgress = true,
          richContent,
          onAction,
          actionLabel,
          ...props
        }) {
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                mass: 0.8
              }}
              layout
            >
              <Toast 
                variant={variant} 
                duration={duration}
                persistent={persistent}
                className="relative overflow-hidden group"
                {...props}
              >
                <div className="flex items-start space-x-3 w-full">
                  <ToastIcon variant={variant} />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    {title && (
                      <ToastTitle className="font-semibold text-white">
                        {title}
                      </ToastTitle>
                    )}
                    
                    {description && (
                      <ToastDescription className="text-white/80 text-sm leading-relaxed">
                        {description}
                      </ToastDescription>
                    )}
                    
                    {richContent && (
                      <div className="mt-2">
                        {richContent}
                      </div>
                    )}
                    
                    {(action || (onAction && actionLabel)) && (
                      <div className="flex items-center space-x-2 mt-3">
                        {action}
                        {onAction && actionLabel && (
                          <ToastAction onClick={onAction}>
                            {actionLabel}
                          </ToastAction>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <ToastClose />
                
                {showProgress && !persistent && (
                  <ToastProgress 
                    variant={variant}
                    duration={duration}
                  />
                )}
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
}
