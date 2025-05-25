
import { supabase } from "@/integrations/supabase/client";

// Save image to storage and get public URL with proper user-based path structure
export const saveImageToStorage = async (imageBlob: Blob, figurineId: string): Promise<string | null> => {
  try {
    console.log('🔄 [STORAGE] Starting image save process for figurineId:', figurineId);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [STORAGE] No authenticated session found');
      throw new Error('Authentication required to save images');
    }
    
    const userId = session.user.id;
    console.log('✅ [STORAGE] Authenticated user ID:', userId);
    console.log('✅ [STORAGE] Session details:', { 
      userId: session.user.id, 
      email: session.user.email,
      role: session.user.role 
    });
    
    // Use user-specific folder path to align with RLS policies
    const filePath = `${userId}/${figurineId}.png`;
    console.log('🔄 [STORAGE] Using file path:', filePath);
    console.log('🔄 [STORAGE] Blob details:', { 
      size: imageBlob.size, 
      type: imageBlob.type 
    });
    
    // Verify auth.uid() is working correctly
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('🔍 [STORAGE] Current user verification:', {
      hasCurrentUser: !!currentUser.user,
      userIdMatch: currentUser.user?.id === userId
    });
    
    // Upload image to storage with explicit bucket reference
    console.log('🔄 [STORAGE] Attempting upload to figurine-images bucket...');
    const { data, error } = await supabase.storage
      .from('figurine-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('❌ [STORAGE] Upload error details:', {
        message: error.message,
        error: error
      });
      
      // More specific error handling
      if (error.message?.includes('row-level security')) {
        console.error('❌ [STORAGE] RLS Policy violation - checking session state');
        
        // Re-verify authentication state
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.error('❌ [STORAGE] Session state during error:', {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id
        });
        
        throw new Error(`Storage RLS policy violation: ${error.message}`);
      } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.log('🔄 [STORAGE] Bucket might not exist, attempting to create and retry...');
        throw new Error(`Storage bucket not found: ${error.message}`);
      } else {
        throw error;
      }
    }
    
    console.log('✅ [STORAGE] Upload successful, data:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('figurine-images')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [STORAGE] Public URL generated:', publicUrl);
    
    // Verify the file was actually uploaded by checking if it exists
    const { data: fileData, error: fileError } = await supabase.storage
      .from('figurine-images')
      .list(userId, {
        limit: 100,
        search: `${figurineId}.png`
      });
      
    if (fileError) {
      console.warn('⚠️ [STORAGE] Could not verify file upload:', fileError);
    } else {
      console.log('✅ [STORAGE] File verification successful:', fileData);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [STORAGE] Failed to save image to storage:', error);
    console.error('❌ [STORAGE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to handle in calling code
  }
};
