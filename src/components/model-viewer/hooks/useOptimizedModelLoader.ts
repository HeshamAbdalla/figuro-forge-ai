
import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { modelQueueManager } from "../utils/modelQueueManager";
import { loadModelWithFallback } from "../utils/modelLoaderUtils";
import { cleanupResources, webGLContextTracker } from "../utils/resourceManager";
import { disposeModel, handleObjectUrl } from "../utils/modelUtils";
import { validateAndCleanUrl, generateStableModelId } from "@/utils/urlValidationUtils";
import { useToast } from "@/hooks/use-toast";

interface UseOptimizedModelLoaderOptions {
  modelSource: string | null;
  modelBlob?: Blob | null;
  onError?: (error: any) => void;
  priority?: number;
  visible?: boolean;
  modelId?: string;
}

/**
 * Custom hook for optimized model loading with queue management and visibility optimization
 */
export const useOptimizedModelLoader = ({
  modelSource,
  modelBlob,
  onError,
  priority = 0,
  visible = true,
  modelId: providedModelId
}: UseOptimizedModelLoaderOptions) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  
  // Refs for managing resources and preventing memory leaks
  const objectUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousModelRef = useRef<THREE.Group | null>(null);
  const loadAttemptRef = useRef<number>(0);
  const lastLoadTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Stable model ID and source tracking
  const stableModelId = useRef<string>(
    providedModelId || generateStableModelId(modelSource || '', 'unknown')
  );
  
  // Track the active source with validation
  const activeSourceRef = useRef<{
    source: string | Blob | null;
    cleanUrl: string | null;
    timestamp: number;
  }>({
    source: null,
    cleanUrl: null,
    timestamp: 0
  });

  // Stable source determination
  const currentSource = modelBlob || modelSource;
  const validation = validateAndCleanUrl(typeof currentSource === 'string' ? currentSource : null);
  const cleanSourceUrl = validation.isValid ? validation.cleanUrl : null;

  // Generate stable model ID when source changes
  useEffect(() => {
    if (currentSource) {
      const newId = providedModelId || generateStableModelId(
        typeof currentSource === 'string' ? currentSource : 'blob',
        'model'
      );
      stableModelId.current = newId;
    }
  }, [currentSource, providedModelId]);

  // Cleanup function to handle resource disposal properly
  const cleanupActiveResources = useCallback(() => {
    console.log(`🧹 [MODEL-LOADER] Cleaning up resources for ${stableModelId.current}`);
    
    if (previousModelRef.current) {
      disposeModel(previousModelRef.current);
      previousModelRef.current = null;
    }
    
    if (objectUrlRef.current) {
      handleObjectUrl(null, objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Abort any queued load for this model
    modelQueueManager.abortModelLoad(stableModelId.current);
    webGLContextTracker.releaseContext();
  }, []);

  // Check if source has actually changed to prevent unnecessary reloads
  const hasSourceChanged = useCallback(() => {
    const current = activeSourceRef.current;
    
    // For blob sources, compare the blob object directly
    if (modelBlob) {
      return current.source !== modelBlob;
    }
    
    // For URL sources, compare the clean URL
    if (cleanSourceUrl) {
      return current.cleanUrl !== cleanSourceUrl;
    }
    
    // No source provided
    return current.source !== null;
  }, [modelBlob, cleanSourceUrl]);

  // Main loading effect with improved change detection
  useEffect(() => {
    // Skip loading if not visible or no source
    if (!visible || (!modelSource && !modelBlob)) {
      console.log(`⏭️ [MODEL-LOADER] Skipping load for ${stableModelId.current} - not visible or no source`);
      return;
    }

    // Skip if source hasn't actually changed
    if (!hasSourceChanged()) {
      console.log(`⏭️ [MODEL-LOADER] Skipping load for ${stableModelId.current} - source unchanged`);
      return;
    }

    // Prevent rapid successive loads
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    if (timeSinceLastLoad < 1000) { // 1 second debounce
      console.log(`⏭️ [MODEL-LOADER] Debouncing load for ${stableModelId.current}`);
      return;
    }

    // Check WebGL context availability
    if (webGLContextTracker.isNearingLimit()) {
      console.warn(`⚠️ [MODEL-LOADER] WebGL context limit approaching for ${stableModelId.current}`);
      setError(new Error('WebGL context limit reached'));
      return;
    }

    // Update active source tracking
    activeSourceRef.current = {
      source: currentSource,
      cleanUrl: cleanSourceUrl,
      timestamp: now
    };
    lastLoadTimeRef.current = now;

    let isActive = true;
    let localObjectUrl: string | null = null;
    
    const loadModel = async () => {
      loadAttemptRef.current++;
      const currentAttempt = loadAttemptRef.current;
      
      console.log(`🚀 [MODEL-LOADER] Starting load attempt ${currentAttempt} for ${stableModelId.current}`);
      
      // Clean up previous resources before starting new load
      cleanupActiveResources();
      
      // Create a new abort controller for this load
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setLoading(true);
        setError(null);
        setModelLoaded(false);
        
        // Create a URL if we have a blob
        if (modelBlob) {
          console.log(`📦 [MODEL-LOADER] Creating blob URL for ${stableModelId.current}`);
          localObjectUrl = handleObjectUrl(modelBlob, objectUrlRef.current);
          objectUrlRef.current = localObjectUrl;
        }

        // Determine the URL to load
        const urlToLoad = localObjectUrl || cleanSourceUrl;
        if (!urlToLoad) {
          throw new Error('No valid URL to load');
        }

        console.log(`📥 [MODEL-LOADER] Loading model from: ${urlToLoad.substring(0, 50)}...`);

        // Queue the model load
        const loadedModel = await modelQueueManager.queueModelLoad(
          stableModelId.current,
          () => loadModelWithFallback(urlToLoad, { signal }),
          priority
        );

        if (!isActive) {
          console.log(`❌ [MODEL-LOADER] Load cancelled for ${stableModelId.current}`);
          return;
        }

        console.log(`✅ [MODEL-LOADER] Model loaded successfully for ${stableModelId.current}`);
        
        // Store reference for future disposal
        previousModelRef.current = loadedModel;
        setModel(loadedModel);
        setModelLoaded(true);
        
        // Reset load attempt counter on success
        loadAttemptRef.current = 0;
        
      } catch (err) {
        if (!isActive) return;
        
        console.error(`❌ [MODEL-LOADER] Error loading model ${stableModelId.current}:`, err);
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log(`🛑 [MODEL-LOADER] Load aborted for ${stableModelId.current}`);
            return;
          }
          
          if (err.message.includes('context') || err.message.includes('WebGL')) {
            webGLContextTracker.releaseContext();
            setError(new Error('WebGL context error - try refreshing the page'));
          } else {
            setError(err);
          }
        } else {
          setError(new Error('Unknown loading error'));
        }
        
        if (onError) {
          onError(err);
        }
      } finally {
        if (isActive) {
          setLoading(false);
          webGLContextTracker.releaseContext();
        }
      }
    };

    // Add small delay to prevent immediate successive loads
    const loadTimer = setTimeout(() => {
      if (isActive) {
        loadModel();
      }
    }, 100);

    // Cleanup function
    return () => {
      isActive = false;
      clearTimeout(loadTimer);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [
    visible,
    currentSource,
    cleanSourceUrl,
    priority,
    onError,
    hasSourceChanged,
    cleanupActiveResources
  ]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      console.log(`🧹 [MODEL-LOADER] Component unmounting, cleaning up ${stableModelId.current}`);
      cleanupActiveResources();
      
      if (model) {
        disposeModel(model);
      }
      
      activeSourceRef.current = {
        source: null,
        cleanUrl: null,
        timestamp: 0
      };
    };
  }, [cleanupActiveResources, model]);

  return { 
    loading, 
    model,
    error,
    modelLoaded,
    modelId: stableModelId.current
  };
};
