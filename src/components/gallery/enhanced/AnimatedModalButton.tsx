
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedModalButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AnimatedModalButton: React.FC<AnimatedModalButtonProps> = ({
  icon: Icon,
  onClick,
  title,
  disabled = false,
  active = false,
  variant = "ghost",
  size = "md",
  className
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return active
          ? "bg-figuro-accent/30 text-figuro-accent border-figuro-accent/50"
          : "text-white/70 hover:text-white hover:bg-figuro-accent/20 hover:border-figuro-accent/30";
      case "secondary":
        return active
          ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
          : "text-white/70 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30";
      case "danger":
        return "text-white/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30";
      default:
        return active
          ? "bg-white/10 text-white border-white/20"
          : "text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-11 w-11";
      default:
        return "h-9 w-9";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 20;
      default:
        return 16;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
          getSizeStyles(),
          "rounded-full transition-all duration-200 border border-transparent",
          getVariantStyles(),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <motion.div
          animate={active ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Icon size={getIconSize()} />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default AnimatedModalButton;
