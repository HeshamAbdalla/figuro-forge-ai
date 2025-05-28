
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveFigurine, updateFigurineWithModelUrl } from "@/services/figurineService";
import { generateImage } from "@/services/generationService";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { downloadAndSaveModel } from "@/utils/modelUtils";

// Define the return type for handleGenerate to make it consistent
export type GenerateResult = {
  success: boolean;
  needsApiKey: boolean;
  error?: string;
};

export const useImageGeneration = () => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [requiresApiKey, setRequiresApiKey] = useState(false);
  const [currentFigurineId, setCurrentFigurineId] = useState<string | null>(null);
  const [generationMethod, setGenerationMethod] = useState<"edge" | "direct" | null>(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionError, setConversionError] = useState<string | null>(null);
  
  // Request deduplication refs
  const isGenerationInProgress = useRef(false);
  const currentRequestId = useRef<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentTaskRef = useRef<string | null>(null);
  const modelUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Update the ref when modelUrl changes
  useEffect(() => {
    modelUrlRef.current = modelUrl;
  }, [modelUrl]);

  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Helper function to convert image to base64
  const imageUrlToBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extract just the base64 part without the data URL prefix
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  // Enhanced model download and save function with better error handling
  const downloadAndSaveModelWithRetry = async (externalUrl: string, figurineId: string, maxRetries = 3): Promise<string | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [CONVERSION] Attempt ${attempt}/${maxRetries} to download and save model...`);
        
        const storedModelUrl = await downloadAndSaveModel(
          externalUrl, 
          `figurine_${figurineId}`
        );
        
        if (storedModelUrl) {
          console.log(`✅ [CONVERSION] Model successfully saved on attempt ${attempt}`);
          return storedModelUrl;
        }
      } catch (error) {
        console.error(`❌ [CONVERSION] Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error(`❌ [CONVERSION] All ${maxRetries} attempts failed`);
          throw error;
        } else {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ [CONVERSION] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    return null;
  };

  // Set up SSE connection for real-time updates on conversion
  const setupSSEConnection = (taskId: string) => {
    // Store the current task ID
    currentTaskRef.current = taskId;
    
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const sseUrl = `${SUPABASE_URL}/functions/v1/check-3d-status?taskId=${taskId}&sse=true`;
    console.log(`Setting up SSE connection to: ${sseUrl}`);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    // Handle connection error
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      // Don't set an error if we already have a model URL
      if (!modelUrlRef.current) {
        // Start polling as a fallback if SSE connection fails
        pollTaskStatus(taskId);
      }
      
      eventSource.close();
      eventSourceRef.current = null;
    };

    // Handle general messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        
        // Update progress if available
        if (data.progress !== undefined) {
          setConversionProgress(data.progress);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    // Handle specific events
    eventSource.addEventListener('connected', (event: any) => {
      console.log('SSE connected event:', event.data ? JSON.parse(event.data) : event);
    });

    eventSource.addEventListener('status', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE status update:', data);
        
        // Update progress
        if (data.progress !== undefined) {
          setConversionProgress(data.progress);
        }
      } catch (error) {
        console.error('Error parsing SSE status:', error);
      }
    });

    eventSource.addEventListener('processing', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE processing update:', data);
        setConversionProgress(data.progress || 0);
      } catch (error) {
        console.error('Error parsing SSE processing event:', error);
      }
    });

    eventSource.addEventListener('completed', async (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE completed event:', data);
        
        // Handle completion
        if (data.modelUrl) {
          try {
            setConversionProgress(95); // Show near completion
            
            // Show initial success message
            toast({
              title: "3D model created",
              description: "Downloading and saving your 3D model to gallery...",
            });
            
            // Attempt to download and save the model to our storage
            if (currentFigurineId) {
              console.log('🔄 [CONVERSION] Starting enhanced model download and save process...');
              
              try {
                // Download and save the model to our storage with retry logic
                const storedModelUrl = await downloadAndSaveModelWithRetry(
                  data.modelUrl, 
                  currentFigurineId
                );
                
                if (storedModelUrl) {
                  // Update the model URL to our stored version
                  setModelUrl(storedModelUrl);
                  setConversionProgress(100);
                  
                  // Update figurine with the stored model URL
                  await updateFigurineWithModelUrl(currentFigurineId, storedModelUrl);
                  
                  console.log('✅ [CONVERSION] Model successfully saved to gallery storage');
                  toast({
                    title: "3D model saved to gallery",
                    description: "Your figurine is ready to view in 3D and has been added to the gallery",
                  });
                } else {
                  throw new Error("Failed to save model to storage");
                }
              } catch (saveError) {
                console.error('❌ [CONVERSION] Error during model save process:', saveError);
                
                // Fallback to the external URL if storage failed
                setModelUrl(data.modelUrl);
                setConversionProgress(100);
                await updateFigurineWithModelUrl(currentFigurineId, data.modelUrl);
                
                toast({
                  title: "3D model created",
                  description: "Your figurine is ready to view in 3D (using external hosting - storage save failed)",
                  variant: "default"
                });
              }
            } else {
              console.log('ℹ️ [CONVERSION] No figurine ID available, using external URL');
              setModelUrl(data.modelUrl);
              setConversionProgress(100);
              
              toast({
                title: "3D model created",
                description: "Your 3D model is ready to view",
              });
            }
            
            setIsConverting(false);
            setConversionError(null);
          } catch (error) {
            console.error('❌ [CONVERSION] Error in completion handler:', error);
            
            // Ensure we still show the model even if save fails
            setModelUrl(data.modelUrl);
            setConversionProgress(100);
            setIsConverting(false);
            
            if (currentFigurineId) {
              await updateFigurineWithModelUrl(currentFigurineId, data.modelUrl);
            }
          }
          
          // Close the connection as we're done
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (error) {
        console.error('Error parsing SSE completed event:', error);
      }
    });

    eventSource.addEventListener('failed', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.error('SSE failure event:', data);
        
        // Only set error if we don't already have a model URL
        if (!modelUrlRef.current) {
          const errorMessage = data.error || data.details || 'Conversion failed';
          setConversionError(errorMessage);
          
          toast({
            title: "Conversion failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        setIsConverting(false);
        
        // Close the connection as we're done
        eventSource.close();
        eventSourceRef.current = null;
      } catch (error) {
        console.error('Error parsing SSE failed event:', error);
      }
    });

    eventSource.addEventListener('error', (event: any) => {
      try {
        let errorData;
        try {
          errorData = event.data ? JSON.parse(event.data) : { error: 'Unknown error' };
        } catch (e) {
          errorData = { error: 'Unknown error' };
        }
        console.error('SSE error event:', errorData);
        
        // Don't set error if we already have a model URL
        if (!modelUrlRef.current) {
          // Check task status directly as fallback
          pollTaskStatus(taskId);
        }
        
        // Close the connection as we're done
        eventSource.close();
        eventSourceRef.current = null;
      } catch (error) {
        console.error('Error handling SSE error event:', error);
      }
    });

    return eventSource;
  };

  // Fallback polling mechanism when SSE fails
  const pollTaskStatus = async (taskId: string, maxAttempts = 60, delay = 5000) => {
    // Don't start polling if we already have a model URL
    if (modelUrlRef.current) return;
    
    let attempts = 0;
    
    const checkInterval = setInterval(async () => {
      // If we already have a model URL or we're checking a different task, stop polling
      if (
        attempts >= maxAttempts || 
        modelUrlRef.current !== null || 
        taskId !== currentTaskRef.current
      ) {
        clearInterval(checkInterval);
        return;
      }
      
      attempts++;
      try {
        const statusResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-3d-status?taskId=${taskId}`);
        
        if (!statusResponse.ok) {
          console.error(`Error checking status (attempt ${attempts}):`, statusResponse.status);
          return;
        }
        
        const statusData = await statusResponse.json();
        console.log(`Status check (attempt ${attempts}):`, statusData);
        
        // Update progress
        if (statusData.progress !== undefined) {
          setConversionProgress(statusData.progress);
        }
        
        // Check if completed
        if (statusData.modelUrl) {
          clearInterval(checkInterval);
          
          // Enhanced model saving with retry logic
          try {
            if (currentFigurineId) {
              console.log('🔄 [CONVERSION] Starting model save from polling...');
              
              const storedModelUrl = await downloadAndSaveModelWithRetry(
                statusData.modelUrl, 
                currentFigurineId
              );
              
              if (storedModelUrl) {
                setModelUrl(storedModelUrl);
                await updateFigurineWithModelUrl(currentFigurineId, storedModelUrl);
                
                toast({
                  title: "3D model saved to gallery",
                  description: "Your figurine is ready to view in 3D",
                });
              } else {
                // Fallback to external URL
                setModelUrl(statusData.modelUrl);
                await updateFigurineWithModelUrl(currentFigurineId, statusData.modelUrl);
                
                toast({
                  title: "3D model created",
                  description: "Your 3D model is ready to view",
                });
              }
            } else {
              setModelUrl(statusData.modelUrl);
              
              toast({
                title: "3D model created",
                description: "Your 3D model is ready to view",
              });
            }
          } catch (error) {
            console.error('❌ [CONVERSION] Error saving model from polling:', error);
            // Still show the model even if saving fails
            setModelUrl(statusData.modelUrl);
            if (currentFigurineId) {
              await updateFigurineWithModelUrl(currentFigurineId, statusData.modelUrl);
            }
          }
          
          setConversionError(null); // Clear any errors since we got a valid URL
          setIsConverting(false);
        } else if (statusData.error && !modelUrlRef.current) {
          clearInterval(checkInterval);
          setConversionError(statusData.error);
          setIsConverting(false);
          
          toast({
            title: "Conversion failed",
            description: statusData.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(`Error checking status (attempt ${attempts}):`, error);
      }
    }, delay);
    
    // Clean up the interval on unmount
    return () => clearInterval(checkInterval);
  };

  // Generate image using a single generation attempt strategy with request deduplication
  const handleGenerate = async (prompt: string, style: string, apiKey: string = "", preGeneratedImageUrl?: string): Promise<GenerateResult> => {
    // Create a unique request ID for this generation
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎯 [GENERATION] Starting generation request ${requestId} for prompt: "${prompt}"`);
    
    // Check if a generation is already in progress
    if (isGenerationInProgress.current) {
      console.log(`⚠️ [GENERATION] Request ${requestId} blocked - generation already in progress (${currentRequestId.current})`);
      toast({
        title: "Generation in progress",
        description: "Please wait for the current generation to complete",
        variant: "default",
      });
      return { success: false, needsApiKey: false, error: "Generation already in progress" };
    }

    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Authentication required to generate figurines');
    }

    // Set the generation lock
    isGenerationInProgress.current = true;
    currentRequestId.current = requestId;
    
    console.log(`🔒 [GENERATION] Request ${requestId} acquired generation lock`);

    const savedApiKey = localStorage.getItem("tempHuggingFaceApiKey") || apiKey;
    
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setModelUrl(null);
    setCurrentFigurineId(null);
    setGenerationMethod(null);
    setConversionProgress(0);
    setConversionError(null);
    
    try {
      let imageUrl: string | null = null;
      let imageBlob: Blob | null = null;

      // Use the pre-generated image URL if provided
      if (preGeneratedImageUrl) {
        imageUrl = preGeneratedImageUrl;
        setGenerationMethod("edge"); // Assume it came from edge if pre-generated
        
        // Fetch the blob from the URL for storage
        const response = await fetch(preGeneratedImageUrl);
        imageBlob = await response.blob();
      } else {
        // Make a single generation request to the service layer
        console.log(`🚀 [GENERATION] Request ${requestId} making API call to service layer`);
        const result = await generateImage(prompt, style, savedApiKey);
        
        if (result.error) {
          // Check if the error is about API key
          if (result.error.includes("API key") || result.error.includes("unauthorized")) {
            setRequiresApiKey(true);
            return { success: false, needsApiKey: true, error: result.error };
          }
          
          throw new Error(result.error);
        }
        
        setGenerationMethod(result.method);
        
        // We don't need an API key anymore if we got a successful response
        setRequiresApiKey(false);
        
        imageBlob = result.blob;
        imageUrl = result.url;
        
        console.log(`✅ [GENERATION] Request ${requestId} successfully generated image via ${result.method} method`);
      }
      
      // Save the figurine to Supabase if we have an image
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        
        toast({
          title: "Image generated",
          description: `Created "${prompt}" in ${style} style using ${generationMethod || "API"} method`,
        });
        
        try {
          const figurineId = await saveFigurine(prompt, style, imageUrl, imageBlob);
          
          if (figurineId) {
            setCurrentFigurineId(figurineId);
            console.log(`💾 [GENERATION] Request ${requestId} saved figurine with ID: ${figurineId}`);
          }
        } catch (saveError) {
          console.error(`❌ [GENERATION] Request ${requestId} error saving figurine:`, saveError);
          toast({
            title: "Save failed",
            description: "Image generated but failed to save to database",
            variant: "destructive",
          });
          // Continue anyway since we have the image
        }
      }
      
      console.log(`🎉 [GENERATION] Request ${requestId} completed successfully`);
      return { success: true, needsApiKey: false };
    } catch (error) {
      console.error(`❌ [GENERATION] Request ${requestId} failed:`, error);
      
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
      
      return { 
        success: false, 
        needsApiKey: requiresApiKey,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      setIsGeneratingImage(false);
      // Release the generation lock
      isGenerationInProgress.current = false;
      currentRequestId.current = null;
      console.log(`🔓 [GENERATION] Request ${requestId} released generation lock`);
    }
  };

  // Convert image to 3D model using Meshy.ai API with webhook and SSE
  const handleConvertTo3D = async () => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);
    setConversionError(null);
    setModelUrl(null);
    modelUrlRef.current = null;
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Check if the image URL is a blob URL
      const isBlobUrl = generatedImage.startsWith('blob:');
      let requestBody: any = {};
      
      if (isBlobUrl) {
        console.log("Converting blob URL to base64...");
        const base64Data = await imageUrlToBase64(generatedImage);
        if (!base64Data) {
          throw new Error("Failed to convert image to base64");
        }
        requestBody = { imageBase64: base64Data };
      } else {
        // Use the URL directly
        requestBody = { imageUrl: generatedImage };
      }
      
      console.log("Sending conversion request to edge function...");
      
      // Call the convert-to-3d edge function using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: requestBody
      });
      
      if (error) {
        console.error("Error response from edge function:", error);
        
        // Handle specific error cases with better messages
        if (error.message?.includes('limit reached') || error.message?.includes('429')) {
          throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
        }
        
        if (error.message?.includes('Model conversion limit reached')) {
          throw new Error('You have reached your monthly 3D model conversion limit. Please upgrade your plan or wait until next month.');
        }
        
        throw new Error(error.message || 'Failed to convert image to 3D model');
      }
      
      if (!data?.taskId) {
        throw new Error("No task ID returned from conversion service");
      }
      
      console.log("Conversion task started with ID:", data.taskId);
      toast({
        title: "3D conversion started",
        description: "Your 3D model is being created. You'll see real-time updates.",
      });
      
      // Set up SSE connection for real-time updates
      setupSSEConnection(data.taskId);
      
      // Start checking status periodically as a backup to SSE
      pollTaskStatus(data.taskId);
      
    } catch (error) {
      console.error("Conversion error:", error);
      setConversionError(error instanceof Error ? error.message : "Unknown error");
      setIsConverting(false);
      
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Failed to convert to 3D model",
        variant: "destructive",
      });
    }
  };

  return {
    isGeneratingImage,
    isConverting,
    generatedImage,
    modelUrl,
    handleGenerate,
    handleConvertTo3D,
    requiresApiKey,
    currentFigurineId,
    generationMethod,
    conversionProgress,
    conversionError
  };
};
