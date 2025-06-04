
interface ModelDebugInfo {
  id: string;
  title: string;
  model_url: string;
  style: string;
  image_url: string;
  saved_image_url: string | null;
  prompt: string;
  created_at: string;
  is_public: boolean;
}

export const logModelDebugInfo = (figurine: ModelDebugInfo) => {
  console.group(`🔍 [MODEL-DEBUG] Figurine Debug Info: ${figurine.title || figurine.id}`);
  
  console.log('📋 Basic Info:', {
    id: figurine.id,
    title: figurine.title,
    style: figurine.style,
    prompt: figurine.prompt,
    created_at: figurine.created_at,
    is_public: figurine.is_public
  });
  
  console.log('🖼️ Image URLs:', {
    original_image: figurine.image_url,
    saved_image: figurine.saved_image_url
  });
  
  console.log('🎯 Model URL Analysis:', {
    model_url: figurine.model_url,
    is_supabase_storage: figurine.model_url?.includes('cwjxbwqdfejhmiixoiym.supabase.co/storage'),
    is_meshy_url: figurine.model_url?.includes('meshy.ai'),
    is_blob_url: figurine.model_url?.startsWith('blob:'),
    url_length: figurine.model_url?.length || 0
  });
  
  // Check for potential issues
  const issues = [];
  if (!figurine.model_url) {
    issues.push('❌ No model URL provided');
  }
  if (figurine.model_url?.includes('meshy.ai') && figurine.model_url.includes('Expires=')) {
    const urlObj = new URL(figurine.model_url);
    const expiresTimestamp = parseInt(urlObj.searchParams.get('Expires') || '0');
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (expiresTimestamp < currentTimestamp) {
      issues.push('⚠️ Meshy URL appears to be expired');
    } else {
      const timeUntilExpiry = expiresTimestamp - currentTimestamp;
      issues.push(`⏰ Meshy URL expires in ${Math.floor(timeUntilExpiry / 3600)} hours`);
    }
  }
  
  if (issues.length > 0) {
    console.warn('🚨 Potential Issues:', issues);
  } else {
    console.log('✅ No obvious issues detected');
  }
  
  console.groupEnd();
};

export const testUrlAccessibility = async (url: string): Promise<{
  accessible: boolean;
  method: string;
  error?: string;
}> => {
  if (!url) {
    return { accessible: false, method: 'none', error: 'No URL provided' };
  }
  
  // Test direct access
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return { accessible: true, method: 'direct-no-cors' };
  } catch (error) {
    // Test with CORS
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return { accessible: response.ok, method: 'direct-cors' };
    } catch (corsError) {
      const errorMessage = corsError instanceof Error ? corsError.message : 'Unknown error';
      return { accessible: false, method: 'none', error: errorMessage };
    }
  }
};
