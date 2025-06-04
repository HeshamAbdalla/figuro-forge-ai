
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecoveryButtonProps {
  onRecovery: () => Promise<void>;
  isRecovering: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const RecoveryButton: React.FC<RecoveryButtonProps> = ({
  onRecovery,
  isRecovering,
  className,
  variant = "outline",
  size = "default"
}) => {
  return (
    <Button
      onClick={onRecovery}
      disabled={isRecovering}
      variant={variant}
      size={size}
      className={cn(
        "border-white/20 text-white/70 hover:bg-white/10",
        className
      )}
    >
      {isRecovering ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Search className="h-4 w-4 mr-2" />
      )}
      {isRecovering ? 'Searching...' : 'Find Missing Models'}
    </Button>
  );
};

export default RecoveryButton;
