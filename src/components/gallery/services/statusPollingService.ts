
import { imageToPhotoStatusService, ImageTo3DCallbacks } from '@/services/imageToPhotoStatusService';

// Re-export the consolidated service for backward compatibility
export const pollConversionStatus = async (
  taskId: string,
  fileName: string,
  originalImageUrl: string,
  callbacks: ImageTo3DCallbacks,
  shouldUpdateExisting: boolean = true
): Promise<void> => {
  console.log('🔄 [STATUS-POLLING] Delegating to consolidated service...');
  
  return imageToPhotoStatusService.pollForCompletion(
    taskId,
    fileName,
    originalImageUrl,
    callbacks,
    shouldUpdateExisting
  );
};

// Export the service for direct access
export { imageToPhotoStatusService };
