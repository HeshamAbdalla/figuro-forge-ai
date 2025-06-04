
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { imageToPhotoStatusService } from '@/services/imageToPhotoStatusService';
import { supabase } from '@/integrations/supabase/client';

export const useImageTo3DRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const runRecovery = async () => {
    try {
      setIsRecovering(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      console.log('🔄 [RECOVERY] Starting orphaned model recovery...');
      
      const result = await imageToPhotoStatusService.findOrphanedModels(session.user.id);
      
      if (result.linked > 0) {
        toast({
          title: "Recovery Complete",
          description: `Found and linked ${result.linked} orphaned 3D models to your gallery.`,
        });
      } else if (result.found > 0) {
        toast({
          title: "No Recovery Needed",
          description: "All your 3D models are already properly linked.",
        });
      } else {
        toast({
          title: "No Models Found",
          description: "No completed 3D conversions found that need recovery.",
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [RECOVERY] Recovery failed:', error);
      
      toast({
        title: "Recovery Failed",
        description: error instanceof Error ? error.message : "Failed to recover orphaned models",
        variant: "destructive"
      });
      
      return { found: 0, linked: 0 };
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    runRecovery,
    isRecovering
  };
};
