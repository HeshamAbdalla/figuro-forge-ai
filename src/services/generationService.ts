
import { SUPABASE_URL } from "@/integrations/supabase/client";

// Generate image using the edge function
export const generateImage = async (prompt: string, style: string, apiKey: string = ""): Promise<{blob: Blob | null, url: string | null, error?: string, method: "edge" | "direct"}> => {
  try {
    console.log("Generating image via edge function...");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompt,
        style
      }),
    });
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", response.status, errorText);
      
      let errorMessage = `Edge function error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
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
    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log("Successfully generated image via edge function");
    
    return { 
      blob: imageBlob, 
      url: imageUrl, 
      method: "edge" 
    };
    
  } catch (error) {
    console.error("Generation error:", error);
    return { 
      blob: null, 
      url: null,
      error: error instanceof Error ? error.message : "Failed to generate image",
      method: "edge"
    };
  }
};
