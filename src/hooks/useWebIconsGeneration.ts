
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import { saveFigurine } from "@/services/figurineService";

export interface WebIconGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface WebIconGenerationOptions {
  category: string;
  size: string;
  style: string;
}

export const useWebIconsGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null);
  const { toast } = useToast();

  const generateIcon = useCallback(async (
    prompt: string, 
    options: WebIconGenerationOptions
  ): Promise<WebIconGenerationResult> => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your icon",
        variant: "destructive"
      });
      return { success: false, error: "Empty prompt" };
    }

    setIsGenerating(true);
    
    try {
      console.log("Generating web icon...", { prompt, options });
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-web-icon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          category: options.category,
          size: options.size,
          style: options.style
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Web icon generation error:", response.status, errorText);
        
        let errorMessage = `Generation failed: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { success: false, error: errorMessage };
      }
      
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setGeneratedIcon(imageUrl);
      
      // Save the web icon to the database
      try {
        const iconTitle = `Web Icon: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`;
        
        await saveFigurine(
          iconTitle,
          'web-icon', // Use 'web-icon' as the style to differentiate from regular images
          imageUrl,
          imageBlob,
          {
            file_type: 'web-icon',
            metadata: {
              generation_options: options,
              original_prompt: prompt,
              icon_category: options.category,
              icon_size: options.size,
              icon_style: options.style
            }
          }
        );
        
        console.log("Web icon saved to gallery successfully");
        
        toast({
          title: "Icon generated & saved!",
          description: "Your web icon is ready and has been added to your gallery",
        });
      } catch (saveError) {
        console.error("Failed to save web icon to gallery:", saveError);
        // Still show success for generation, but warn about save failure
        toast({
          title: "Icon generated successfully!",
          description: "Icon created but couldn't be saved to gallery. You can still download it.",
        });
      }
      
      console.log("Successfully generated web icon");
      
      return { success: true, imageUrl };
      
    } catch (error) {
      console.error("Web icon generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate icon";
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearIcon = useCallback(() => {
    setGeneratedIcon(null);
  }, []);

  return {
    isGenerating,
    generatedIcon,
    generateIcon,
    clearIcon
  };
};
