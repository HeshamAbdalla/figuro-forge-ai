
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format prompt according to selected style
function formatStylePrompt(basePrompt: string, style: string): string {
  switch (style) {
    case "isometric":
      return `${basePrompt}, RBNBICN, icon, white background, isometric perspective, 3D-like, clean lines, detailed, professional design, high quality`;
    case "anime":
      return `${basePrompt}, anime style, vibrant colors, white background`;
    case "pixar":
      return `${basePrompt}, pixar style, 3D character, white background`;
    case "steampunk":
      return `${basePrompt}, steampunk style, brass gears, vintage, white background`;
    case "lowpoly":
      return `${basePrompt}, low poly 3D model, geometric, white background`;
    case "cyberpunk":
      return `${basePrompt}, cyberpunk style, neon colors, futuristic, white background`;
    case "realistic":
      return `${basePrompt}, realistic 3D render, detailed texture, white background`;
    case "chibi":
      return `${basePrompt}, chibi style, cute, small body, big head, white background`;
    default:
      return `${basePrompt}, 3D figurine, white background`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();
    
    if (!prompt || !style) {
      throw new Error("Missing required parameters: prompt and style are required");
    }
    
    // Format the prompt based on the style
    const formattedPrompt = formatStylePrompt(prompt, style);
    
    // Determine if we should use a specific LoRA adapter
    const useLoraAdapter = style === "isometric" ? "multimodalart/isometric-skeumorphic-3d-bnb" : undefined;
    
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
    
    console.log("Making request to Hugging Face API with prompt:", formattedPrompt);
    
    // Make the API request
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev", {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        inputs: formattedPrompt,
        options: {
          use_lora: !!useLoraAdapter,
          lora_weights: useLoraAdapter
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
    
    console.log("Successfully generated image, size:", imageData.byteLength);
    
    // Return the image with proper content type
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
      }
    });
  } catch (error) {
    console.error("Edge function error:", error);
    
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
