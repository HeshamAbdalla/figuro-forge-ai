
import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { imageToPhotoStatusService } from '@/services/imageToPhotoStatusService';

export interface RecoveryResult {
  found: number;
  linked: number;
  success: boolean;
  error?: string;
}

export const useImageTo3DRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useEnhancedAuth();
  const { toast } = useToast();

  const runRecovery = useCallback(async (): Promise<RecoveryResult> => {
    if (!user?.id) {
      const errorResult = { found: 0, linked: 0, success: false, error: 'User not authenticated' };
      
      toast({
        title: "Authentication Required",
        description: "Please sign in to recover your models.",
        variant: "destructive"
      });
      
      return errorResult;
    }

    setIsRecovering(true);
    console.log('🔍 [RECOVERY] Starting model recovery for user:', user.id);

    try {
      const result = await imageToPhotoStatusService.findOrphanedModels(user.id);
      
      console.log('✅ [RECOVERY] Recovery completed:', result);

      if (result.linked > 0) {
        toast({
          title: "Models Recovered!",
          description: `Successfully linked ${result.linked} missing models to your gallery.`,
        });
      } else if (result.found === 0) {
        toast({
          title: "No Missing Models",
          description: "All your converted models are already in the gallery.",
        });
      } else {
        toast({
          title: "Recovery Complete",
          description: "No orphaned models found that could be recovered.",
        });
      }

      return {
        found: result.found,
        linked: result.linked,
        success: true
      };

    } catch (error) {
      console.error('❌ [RECOVERY] Recovery failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Recovery Failed",
        description: `Could not recover models: ${errorMessage}`,
        variant: "destructive"
      });

      return {
        found: 0,
        linked: 0,
        success: false,
        error: errorMessage
      };
    } finally {
      setIsRecovering(false);
    }
  }, [user?.id, toast]);

  return {
    runRecovery,
    isRecovering
  };
};
