
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelPreviewToastProps {
  type: "success" | "error" | "info";
  title: string;
  description: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  duration?: number;
}

const ModelPreviewToast: React.FC<ModelPreviewToastProps> = ({
  type,
  title,
  description,
  onClose,
  onAction,
  actionLabel,
  duration = 5000
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30"
        };
      case "error":
        return {
          icon: AlertTriangle,
          color: "from-red-500 to-pink-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30"
        };
      default:
        return {
          icon: Download,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30"
        };
    }
  };

  const config = getToastConfig();
  const ToastIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        fixed top-4 right-4 z-[200] max-w-sm w-full 
        ${config.bgColor} ${config.borderColor} 
        border rounded-xl p-4 backdrop-blur-xl shadow-2xl
      `}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}
        >
          <ToastIcon className="w-4 h-4 text-white" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h4
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold text-white"
          >
            {title}
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-white/70 mt-1"
          >
            {description}
          </motion.p>
          
          {onAction && actionLabel && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2"
            >
              <Button
                size="sm"
                onClick={onAction}
                className={`h-6 px-2 text-xs bg-gradient-to-r ${config.color} hover:scale-105 transition-all duration-200 text-white border-0`}
              >
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onClose}
          className="text-white/50 hover:text-white/80 transition-colors duration-200"
        >
          <X size={14} />
        </motion.button>
      </div>
      
      {/* Progress Bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.color} rounded-b-xl`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
};

export default ModelPreviewToast;
