
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

// Enhanced authentication validation
const validateAuthentication = async (): Promise<{ isValid: boolean; session: any }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [GENERATION] Auth session error:', error);
      return { isValid: false, session: null };
    }
    
    if (!session?.access_token) {
      console.error('❌ [GENERATION] No access token available');
      return { isValid: false, session: null };
    }
    
    // Check token expiration
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      console.error('❌ [GENERATION] Session expired');
      return { isValid: false, session: null };
    }
    
    return { isValid: true, session };
  } catch (error) {
    console.error('❌ [GENERATION] Auth validation error:', error);
    return { isValid: false, session: null };
  }
};

// Generate image using the edge function with enhanced error handling
export const generateImage = async (prompt: string, style: string, apiKey: string = ""): Promise<{blob: Blob | null, url: string | null, error?: string, method: "edge" | "direct"}> => {
  try {
    console.log("🔄 [GENERATION] Generating image via edge function...");
    
    // Enhanced authentication check
    const { isValid, session } = await validateAuthentication();
    if (!isValid || !session) {
      return {
        blob: null,
        url: null,
        error: "Authentication required. Please refresh the page and try again.",
        method: "edge"
      };
    }

    const supabaseUrl = SUPABASE_URL;
    if (!supabaseUrl) {
      return {
        blob: null,
        url: null,
        error: "Supabase configuration error",
        method: "edge"
      };
    }
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({ 
        prompt,
        style
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [GENERATION] Edge function error:", response.status, errorText);
      
      let errorMessage = `Generation failed: ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = "Authentication expired. Please refresh the page and try again.";
      } else if (response.status === 429) {
        errorMessage = "Generation limit reached. Please upgrade your plan or try again later.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      
      return { 
        blob: null, 
        url: null,
        error: errorMessage,
        method: "edge"
      };
    }
    
    // Get the image blob
    const imageBlob = await response.blob();
    
    // Validate blob
    if (!imageBlob || imageBlob.size === 0) {
      return {
        blob: null,
        url: null,
        error: "Empty response received from generation service",
        method: "edge"
      };
    }
    
    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log("✅ [GENERATION] Successfully generated image via edge function");
    
    return { 
      blob: imageBlob, 
      url: imageUrl, 
      method: "edge" 
    };
    
  } catch (error) {
    console.error("❌ [GENERATION] Generation error:", error);
    
    let errorMessage = "Failed to generate image";
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      blob: null, 
      url: null,
      error: errorMessage,
      method: "edge"
    };
  }
};
