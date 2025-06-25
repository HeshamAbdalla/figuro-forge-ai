
import { supabase } from "@/integrations/supabase/client";

export interface DeletionResult {
  success: boolean;
  error?: string;
}

// Delete a figurine from the database and associated storage files
export const deleteFigurine = async (figurineId: string): Promise<DeletionResult> => {
  try {
    console.log('🗑️ [DELETION] Starting figurine deletion process for ID:', figurineId);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [DELETION] No authenticated session found');
      throw new Error('Authentication required to delete figurines');
    }
    
    const userId = session.user.id;
    console.log('✅ [DELETION] Authenticated user:', userId);
    
    // First, get the figurine to check ownership and get file URLs
    const { data: figurine, error: fetchError } = await supabase
      .from('figurines')
      .select('*')
      .eq('id', figurineId)
      .eq('user_id', userId) // Ensure user owns this figurine
      .single();
    
    if (fetchError) {
      console.error('❌ [DELETION] Error fetching figurine:', fetchError);
      throw new Error(`Failed to fetch figurine: ${fetchError.message}`);
    }
    
    if (!figurine) {
      console.error('❌ [DELETION] Figurine not found or user does not own it');
      throw new Error('Figurine not found or you do not have permission to delete it');
    }
    
    console.log('✅ [DELETION] Found figurine to delete:', figurine.title);
    
    // Delete storage files if they exist
    const filesToDelete: string[] = [];
    
    // Check for saved image in storage
    if (figurine.saved_image_url && figurine.saved_image_url.includes('supabase.co')) {
      try {
        const url = new URL(figurine.saved_image_url);
        const pathParts = url.pathname.split('/');
        if (pathParts.includes('figurine-images')) {
          const bucketIndex = pathParts.indexOf('figurine-images') + 1;
          const filePath = pathParts.slice(bucketIndex).join('/');
          filesToDelete.push(filePath);
        }
      } catch (urlError) {
        console.warn('⚠️ [DELETION] Could not parse saved image URL:', urlError);
      }
    }
    
    // Check for 3D model in storage
    if (figurine.model_url && figurine.model_url.includes('supabase.co')) {
      try {
        const url = new URL(figurine.model_url);
        const pathParts = url.pathname.split('/');
        if (pathParts.includes('figurine-models')) {
          const bucketIndex = pathParts.indexOf('figurine-models') + 1;
          const filePath = pathParts.slice(bucketIndex).join('/');
          filesToDelete.push(filePath);
        }
      } catch (urlError) {
        console.warn('⚠️ [DELETION] Could not parse model URL:', urlError);
      }
    }
    
    // Delete files from storage
    for (const filePath of filesToDelete) {
      try {
        let bucketName = 'figurine-images';
        if (filePath.includes('.glb') || filePath.includes('.ply')) {
          bucketName = 'figurine-models';
        }
        
        console.log(`🗑️ [DELETION] Deleting file from ${bucketName}:`, filePath);
        
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
        
        if (storageError) {
          console.warn(`⚠️ [DELETION] Failed to delete file ${filePath}:`, storageError);
          // Don't fail the entire deletion if storage cleanup fails
        } else {
          console.log(`✅ [DELETION] Successfully deleted file:`, filePath);
        }
      } catch (fileError) {
        console.warn(`⚠️ [DELETION] Error deleting file ${filePath}:`, fileError);
      }
    }
    
    // Delete the figurine record from database
    const { error: deleteError } = await supabase
      .from('figurines')
      .delete()
      .eq('id', figurineId)
      .eq('user_id', userId); // Double-check ownership
    
    if (deleteError) {
      console.error('❌ [DELETION] Error deleting figurine from database:', deleteError);
      throw new Error(`Failed to delete figurine: ${deleteError.message}`);
    }
    
    console.log('✅ [DELETION] Figurine deleted successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ [DELETION] Error during figurine deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Clean up object URLs to prevent memory leaks
export const cleanupObjectUrl = (url: string): void => {
  try {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      console.log('🧹 [CLEANUP] Revoked object URL:', url);
    }
  } catch (error) {
    console.warn('⚠️ [CLEANUP] Failed to revoke object URL:', error);
  }
};
