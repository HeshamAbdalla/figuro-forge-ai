
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format prompt for web icon generation
function formatWebIconPrompt(basePrompt: string, category: string, size: string, style: string): string {
  let stylePrompt = "";
  
  switch (style) {
    case "isometric":
      stylePrompt = "RBNBICN, isometric style, 3D appearance, clean lines, professional design";
      break;
    case "flat":
      stylePrompt = "flat design, minimal, geometric, solid colors, clean";
      break;
    case "outline":
      stylePrompt = "outline style, line art, minimal, stroke design";
      break;
    case "filled":
      stylePrompt = "filled icon, solid design, bold shapes";
      break;
    default:
      stylePrompt = "clean icon design, professional";
  }
  
  const categoryContext = category !== "general" ? `${category} related,` : "";
  
  return `${basePrompt}, ${categoryContext} ${stylePrompt}, web icon, ${size}, white background, centered, high quality, crisp edges, suitable for web use`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, category, size, style } = await req.json();
    
    if (!prompt) {
      throw new Error("Missing required parameter: prompt is required");
    }
    
    // Set defaults
    const iconCategory = category || "general";
    const iconSize = size || "256x256";
    const iconStyle = style || "isometric";
    
    // Format the prompt for web icon generation
    const formattedPrompt = formatWebIconPrompt(prompt, iconCategory, iconSize, iconStyle);
    
    // Use the Hugging Face token from environment variables
    const hfToken = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    
    if (!hfToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Hugging Face API key not configured on server",
          needsApiKey: false 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create headers with API key
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${hfToken}`,
    };
    
    console.log("Making request to Hugging Face API for web icon with prompt:", formattedPrompt);
    
    // Make the API request
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev", {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        inputs: formattedPrompt,
        options: {
          use_lora: iconStyle === "isometric",
          lora_weights: iconStyle === "isometric" ? "multimodalart/isometric-skeumorphic-3d-bnb" : undefined
        }
      }),
    });
    
    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
    }
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    
    console.log("Successfully generated web icon, size:", imageData.byteLength);
    
    // Return the image with proper content type
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
      }
    });
  } catch (error) {
    console.error("Web icon generation error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        needsApiKey: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
