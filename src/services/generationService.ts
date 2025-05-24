
import { formatStylePrompt } from "@/lib/huggingface";
import { SUPABASE_PUBLISHABLE_KEY, supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { generateImageWithEdge } from "@/lib/edgeFunction";

// Track if the edge function is available
let isEdgeFunctionAvailable: boolean | null = null;

// Simple circuit breaker implementation
const getEdgeFunctionStatus = (): boolean => {
  // Check localStorage first
  const storedStatus = localStorage.getItem("edgeFunctionAvailable");
  if (storedStatus !== null) {
    return storedStatus === "true";
  }
  
  // Default to false initially to prefer direct API calls
  return false;
};

const setEdgeFunctionStatus = (isAvailable: boolean): void => {
  isEdgeFunctionAvailable = isAvailable;
  localStorage.setItem("edgeFunctionAvailable", isAvailable.toString());
  
  // If it's not available, set a timeout to reset after 1 hour (circuit breaker reset)
  if (!isAvailable) {
    setTimeout(() => {
      localStorage.removeItem("edgeFunctionAvailable");
      isEdgeFunctionAvailable = null;
    }, 60 * 60 * 1000); // 1 hour
  }
};

// Generate image using improved fallback strategy
export const generateImage = async (prompt: string, style: string, apiKey: string = ""): Promise<{blob: Blob | null, url: string | null, error?: string, method: "edge" | "direct"}> => {
  try {
    // Use direct API call first for better reliability
    console.log("Using direct API call via edgeFunction.ts...");
    
    const edgeResult = await generateImageWithEdge({
      prompt,
      style, 
      apiKey
    });
    
    if (edgeResult.success && edgeResult.imageUrl) {
      // Fetch the blob from the URL
      const blobResponse = await fetch(edgeResult.imageUrl);
      const blob = await blobResponse.blob();
      
      return {
        blob,
        url: edgeResult.imageUrl,
        method: "direct"
      };
    }
    
    // If direct API failed, try edge function as fallback
    if (getEdgeFunctionStatus()) {
      console.log("Direct API failed, attempting Edge Function fallback...");
      
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY || ''}`
          },
          body: JSON.stringify({ 
            prompt,
            style,
            apiKey
          }),
        });
        
        // Handle 404 errors (edge function not deployed)
        if (response.status === 404) {
          console.warn("Edge function not found, marking as unavailable");
          setEdgeFunctionStatus(false);
          throw new Error("Edge function not available");
        }
        
        // Handle authentication errors
        if (response.status === 401) {
          return { 
            blob: null, 
            url: null,
            error: "API key required or unauthorized access",
            method: "edge"
          };
        }
        
        if (response.ok) {
          setEdgeFunctionStatus(true);
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          return { blob: imageBlob, url: imageUrl, method: "edge" };
        }
        
        throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
        
      } catch (edgeFunctionError) {
        console.warn("Edge function failed:", edgeFunctionError);
        setEdgeFunctionStatus(false);
      }
    }
    
    return { 
      blob: null, 
      url: null,
      error: edgeResult.error || "Failed to generate image with all available methods",
      method: "direct"
    };
    
  } catch (error) {
    console.error("Generation error:", error);
    return { 
      blob: null, 
      url: null,
      error: error instanceof Error ? error.message : "Failed to generate image",
      method: "direct"
    };
  }
};
