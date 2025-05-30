
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Figurine } from "@/types/figurine";
import { saveImageToStorage } from "@/utils/storageUtils";

// Check if a figurine already exists for a given image URL
export const findExistingFigurine = async (imageUrl: string): Promise<string | null> => {
  try {
    console.log('🔍 [FIGURINE] Checking for existing figurine with image URL:', imageUrl);
    
    const { data: existingFigurines, error } = await supabase
      .from('figurines')
      .select('id')
      .or(`image_url.eq.${imageUrl},saved_image_url.eq.${imageUrl}`)
      .limit(1);

    if (error) {
      console.error('❌ [FIGURINE] Error searching for existing figurine:', error);
      return null;
    }

    if (existingFigurines && existingFigurines.length > 0) {
      console.log('✅ [FIGURINE] Found existing figurine:', existingFigurines[0].id);
      return existingFigurines[0].id;
    }

    console.log('📝 [FIGURINE] No existing figurine found for image URL');
    return null;
  } catch (error) {
    console.error('❌ [FIGURINE] Error in findExistingFigurine:', error);
    return null;
  }
};

// Save a new figurine to the database - requires authentication
export const saveFigurine = async (
  prompt: string, 
  style: string, 
  imageUrl: string, 
  imageBlob: Blob | null,
  options?: {
    file_type?: 'image' | 'web-icon' | '3d-model';
    metadata?: Record<string, any>;
  }
): Promise<string | null> => {
  try {
    console.log('🔄 [FIGURINE] Starting figurine save process');
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [FIGURINE] No authenticated session found');
      throw new Error('Authentication required to save figurines');
    }
    
    const userId = session.user.id;
    console.log('✅ [FIGURINE] Authenticated user:', userId);
    console.log('✅ [FIGURINE] Session verification:', {
      hasSession: !!session,
      hasUser: !!session.user,
      userId: session.user.id,
      userEmail: session.user.email
    });
    
    // Generate a new ID for the figurine
    const figurineId = uuidv4();
    console.log('🔄 [FIGURINE] Generated figurine ID:', figurineId);
    
    // Save image to storage if we have a blob
    let savedImageUrl = null;
    if (imageBlob) {
      console.log('🔄 [FIGURINE] Saving image blob to storage...');
      try {
        savedImageUrl = await saveImageToStorage(imageBlob, figurineId);
        console.log('✅ [FIGURINE] Image saved to storage:', savedImageUrl);
      } catch (storageError) {
        console.error('❌ [FIGURINE] Storage save failed:', storageError);
        // Don't proceed with database insert if storage fails
        throw new Error(`Failed to save image to storage: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}`);
      }
    } else if (imageUrl) {
      console.log('🔄 [FIGURINE] Fetching image from URL and saving...');
      // If we only have an URL but no blob, fetch the image and save it
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        savedImageUrl = await saveImageToStorage(blob, figurineId);
        console.log('✅ [FIGURINE] Image fetched and saved to storage:', savedImageUrl);
      } catch (fetchError) {
        console.error('❌ [FIGURINE] Error fetching image from URL:', fetchError);
        // Don't proceed if we can't save the image
        throw new Error(`Failed to fetch and save image: ${fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'}`);
      }
    }
    
    // Create figurine data object with explicit user_id
    const figurineData = {
      id: figurineId,
      user_id: userId, // Explicitly set the user_id for RLS
      prompt: prompt,
      style: style as any, // Cast to any to bypass the strict enum type check
      image_url: imageUrl,
      saved_image_url: savedImageUrl || imageUrl, // Use saved URL or fallback to original
      title: prompt.substring(0, 50),
      is_public: true, // Set all figurines as public by default
      file_type: options?.file_type || 'image', // Default to 'image' if not specified
      metadata: options?.metadata || {} // Default to empty object if not specified
    };
    
    console.log('🔄 [FIGURINE] Preparing to insert figurine data:', {
      id: figurineData.id,
      user_id: figurineData.user_id,
      title: figurineData.title,
      is_public: figurineData.is_public,
      file_type: figurineData.file_type,
      has_saved_image: !!figurineData.saved_image_url,
      has_metadata: Object.keys(figurineData.metadata).length > 0
    });
    
    // Verify authentication before insert
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser || currentUser.id !== userId) {
      console.error('❌ [FIGURINE] User authentication mismatch');
      throw new Error('User authentication error');
    }
    
    console.log('✅ [FIGURINE] User authentication verified for insert');
    
    // Insert new figurine with proper error handling
    const { data, error } = await supabase
      .from('figurines')
      .insert(figurineData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [FIGURINE] Database insert error:', error);
      console.error('❌ [FIGURINE] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      console.error('❌ [FIGURINE] Failed figurine data:', figurineData);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('✅ [FIGURINE] Figurine saved successfully:', data);
    return figurineId;
  } catch (error) {
    console.error('❌ [FIGURINE] Error saving figurine:', error);
    throw error; // Re-throw to handle in the calling code
  }
};

// Update an existing figurine with a model URL
export const updateFigurineWithModelUrl = async (figurineId: string, modelUrl: string): Promise<void> => {
  try {
    console.log('🔄 [FIGURINE] Updating figurine with model URL:', figurineId);
    
    const { error } = await supabase
      .from('figurines')
      .update({ model_url: modelUrl })
      .eq('id', figurineId);
      
    if (error) {
      console.error('❌ [FIGURINE] Model URL update error:', error);
      throw error;
    }
    
    console.log('✅ [FIGURINE] Model URL updated successfully');
  } catch (error) {
    console.error('❌ [FIGURINE] Error updating figurine with model URL:', error);
    throw error;
  }
};

// Update the public status of a figurine
export const updateFigurinePublicStatus = async (figurineId: string, isPublic: boolean): Promise<void> => {
  try {
    console.log('🔄 [FIGURINE] Updating figurine public status:', figurineId, isPublic);
    
    const { error } = await supabase
      .from('figurines')
      .update({ is_public: isPublic })
      .eq('id', figurineId);
      
    if (error) {
      console.error('❌ [FIGURINE] Public status update error:', error);
      throw error;
    }
    
    console.log('✅ [FIGURINE] Public status updated successfully');
  } catch (error) {
    console.error('❌ [FIGURINE] Error updating figurine public status:', error);
    throw error;
  }
};

// Fetch all public figurines for the gallery
export const fetchPublicFigurines = async (): Promise<Figurine[]> => {
  try {
    console.log('🔄 [FIGURINE] Fetching public figurines...');
    
    const { data, error } = await supabase
      .from('figurines')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ [FIGURINE] Error fetching public figurines:', error);
      throw error;
    }
    
    // Map figurines to include best available image URL
    const processedFigurines = (data || []).map((figurine) => {
      // Use saved_image_url if available, otherwise fall back to image_url
      let imageUrl = figurine.saved_image_url || figurine.image_url;
      
      // Add a cache-busting parameter to force reloading if it's a storage URL
      if (imageUrl && imageUrl.includes('supabase.co')) {
        const cacheBuster = `?t=${Date.now()}`;
        imageUrl = imageUrl.includes('?') ? `${imageUrl}&cb=${Date.now()}` : `${imageUrl}${cacheBuster}`;
      }
      
      return {
        ...figurine,
        display_url: imageUrl
      };
    });
    
    console.log('✅ [FIGURINE] Fetched public figurines:', processedFigurines.length);
    return processedFigurines;
  } catch (error) {
    console.error('❌ [FIGURINE] Error fetching public figurines:', error);
    return [];
  }
};
