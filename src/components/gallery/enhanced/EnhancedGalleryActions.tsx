
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useImageTo3DRecovery } from "@/hooks/useImageTo3DRecovery";
import RecoveryButton from "./RecoveryButton";

interface EnhancedGalleryActionsProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

const EnhancedGalleryActions: React.FC<EnhancedGalleryActionsProps> = ({
  onRefresh,
  isLoading = false
}) => {
  const { runRecovery, isRecovering } = useImageTo3DRecovery();

  const handleRecovery = async () => {
    try {
      const result = await runRecovery();
      
      if (result.linked > 0) {
        // Refresh the gallery to show recovered models
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ [GALLERY-ACTIONS] Recovery error:', error);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <RecoveryButton
        onRecovery={handleRecovery}
        isRecovering={isRecovering}
        size="sm"
      />
      
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        className="border-white/20 text-white/70 hover:bg-white/10"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default EnhancedGalleryActions;
