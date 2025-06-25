
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { saveFigurine } from "@/services/figurineService";

export interface WebIconGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  needsUpgrade?: boolean;
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
  
  // Add subscription hook for usage management
  const { canPerformAction, consumeAction, getUpgradeRecommendation } = useSubscription();

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

    // Check if user can perform image generation
    if (!canPerformAction('image_generation')) {
      console.log('🚫 [WEB_ICONS] Generation blocked - usage limit reached');
      
      const recommendation = getUpgradeRecommendation('image_generation');
      
      toast({
        title: "Generation limit reached",
        description: recommendation 
          ? `You've reached your daily limit. Upgrade to ${recommendation.recommendedPlan} for more generations.`
          : "You've reached your daily generation limit. Please upgrade your plan or wait until tomorrow.",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        needsUpgrade: true,
        error: "Generation limit reached" 
      };
    }

    setIsGenerating(true);
    
    try {
      console.log("Generating web icon...", { prompt, options });
      
      // Use Supabase client's functions.invoke() method for authenticated requests
      const { data, error } = await supabase.functions.invoke('generate-web-icon', {
        body: { 
          prompt,
          category: options.category,
          size: options.size,
          style: options.style
        },
      });
      
      if (error) {
        console.error("Web icon generation error:", error);
        
        let errorMessage = `Generation failed: ${error.message || 'Unknown error'}`;
        
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        return { success: false, error: errorMessage };
      }
      
      // The response from the edge function should be a blob (image data)
      // Since we're using functions.invoke(), we need to handle the response differently
      if (!data) {
        throw new Error('No image data received from the server');
      }
      
      // Convert the response to a blob if it's not already
      let imageBlob: Blob;
      if (data instanceof Blob) {
        imageBlob = data;
      } else if (data instanceof ArrayBuffer) {
        imageBlob = new Blob([data], { type: 'image/png' });
      } else {
        // If data is base64 or other format, handle accordingly
        throw new Error('Unexpected response format from server');
      }
      
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Consume the usage credit after successful generation
      const consumeSuccess = await consumeAction('image_generation');
      if (!consumeSuccess) {
        console.error('❌ [WEB_ICONS] Failed to consume usage credit');
        toast({
          title: "Usage tracking error",
          description: "Icon generated but usage tracking failed. Please contact support if this persists.",
          variant: "default",
        });
      } else {
        console.log('✅ [WEB_ICONS] Successfully consumed usage credit');
      }
      
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
  }, [toast, canPerformAction, consumeAction, getUpgradeRecommendation]);

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
