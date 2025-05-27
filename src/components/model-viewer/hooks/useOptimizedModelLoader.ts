
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { modelQueueManager } from "../utils/modelQueueManager";
import { loadModelWithFallback } from "../utils/modelLoaderUtils";
import { cleanupResources, webGLContextTracker } from "../utils/resourceManager";
import { disposeModel, handleObjectUrl } from "../utils/modelUtils";
import { useToast } from "@/hooks/use-toast";

interface UseOptimizedModelLoaderOptions {
  modelSource: string | null;
  modelBlob?: Blob | null;
  onError?: (error: any) => void;
  priority?: number; // Higher number = higher priority
  visible?: boolean; // Whether the model is currently visible
  modelId?: string; // Optional stable ID for the model
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
  const objectUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeSourceRef = useRef<string | null | Blob>(null);
  const previousModelRef = useRef<THREE.Group | null>(null);
  const loadAttemptRef = useRef<number>(0);
  const lastLoadTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Generate a stable ID for this model that won't change between renders
  const modelIdRef = useRef<string>(
    providedModelId || `model-${(modelSource || '').split('/').pop()?.replace(/\.\w+$/, '')}-${Math.random().toString(36).substring(2, 7)}`
  );

  // Cleanup function to handle resource disposal properly
  const cleanupActiveResources = () => {
    if (activeSourceRef.current) {
      // Dispose previous model before cleanup
      if (previousModelRef.current) {
        disposeModel(previousModelRef.current);
        previousModelRef.current = null;
      }
      
      // Only cleanup if we're actually changing sources
      cleanupResources(
        model, 
        objectUrlRef.current,
        abortControllerRef.current
      );
      
      // Abort any queued load for this model
      modelQueueManager.abortModelLoad(modelIdRef.current);
      
      setModel(null);
    }
  };

  // Debounced loading to prevent rapid fire requests
  const debouncedLoad = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending debounced loads
    if (debouncedLoad.current) {
      clearTimeout(debouncedLoad.current);
      debouncedLoad.current = null;
    }

    // Skip loading if not visible
    if (!visible) {
      console.log(`Model ${modelIdRef.current} not visible, skipping load`);
      return;
    }

    // Skip if no model source
    if (!modelSource && !modelBlob) {
      console.log(`No source for model ${modelIdRef.current}, skipping load`);
      return;
    }
    
    // Check if source has actually changed to prevent infinite loops
    const currentSource = modelBlob || modelSource;
    if (activeSourceRef.current === currentSource && model !== null) {
      console.log(`Model ${modelIdRef.current} source unchanged, keeping existing model`);
      return;
    }
    
    // Prevent rapid successive loads
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    if (timeSinceLastLoad < 500) { // 500ms debounce
      console.log(`Model ${modelIdRef.current} load debounced, waiting...`);
      debouncedLoad.current = setTimeout(() => {
        // Trigger the effect again after debounce
        activeSourceRef.current = null;
        setModel(null);
      }, 500 - timeSinceLastLoad);
      return;
    }

    // Check WebGL context availability
    if (webGLContextTracker.isNearingLimit()) {
      console.warn(`Model ${modelIdRef.current} load skipped - WebGL context limit approaching`);
      setError(new Error('Too many 3D models active - WebGL context limit reached'));
      return;
    }
    
    // Store reference to current model before disposal
    if (model) {
      previousModelRef.current = model;
    }
    
    // Update active source reference
    activeSourceRef.current = currentSource;
    lastLoadTimeRef.current = now;
    
    // Clean up previous resources before starting new load
    cleanupActiveResources();

    let isActive = true;
    let localObjectUrl: string | null = null;
    
    // Start loading with enhanced error handling and retry logic
    const loadModel = async () => {
      // Increment load attempt counter
      loadAttemptRef.current++;
      const currentAttempt = loadAttemptRef.current;
      
      console.log(`useModelLoader: Effect triggered for ${modelIdRef.current}`);
      console.log(`Load attempt ${currentAttempt} for ${modelIdRef.current}`);
      
      // Create a new abort controller for this load
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setLoading(true);
        setError(null);
        
        // Create a URL if we have a blob using proper URL management
        if (modelBlob) {
          console.log(`Loading from blob for ${modelIdRef.current}`);
          localObjectUrl = handleObjectUrl(modelBlob, objectUrlRef.current);
          objectUrlRef.current = localObjectUrl;
          console.log(`Created object URL for ${modelIdRef.current}: ${localObjectUrl}`);
        } else if (modelSource) {
          console.log(`Loading from URL string for ${modelIdRef.current}: ${modelSource}`);
        }

        // Queue the model load with priority and retry logic
        const loadedModel = await modelQueueManager.queueModelLoad(
          modelIdRef.current,
          () => loadModelWithFallback(
            localObjectUrl || modelSource!, 
            { signal }
          ),
          priority
        );

        if (!isActive) return;

        console.log(`Model ${modelIdRef.current} loaded successfully`);
        
        // Store reference for future disposal
        previousModelRef.current = loadedModel;
        setModel(loadedModel);
        
        // Reset load attempt counter on success
        loadAttemptRef.current = 0;
        
      } catch (err) {
        if (!isActive) return;
        
        console.error(`Error loading model ${modelIdRef.current} (attempt ${currentAttempt}):`, err);
        
        // Handle specific error types
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log(`Model load ${modelIdRef.current} was aborted`);
            return;
          }
          
          // Check for WebGL context errors
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
          // Release WebGL context tracking
          webGLContextTracker.releaseContext();
        }
      }
    };

    // Add small delay to prevent immediate successive loads
    const loadTimer = setTimeout(() => {
      if (isActive) {
        loadModel();
      }
    }, 50);

    // Cleanup function
    return () => {
      isActive = false;
      clearTimeout(loadTimer);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [modelSource, modelBlob, visible, onError, priority]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending debounced loads
      if (debouncedLoad.current) {
        clearTimeout(debouncedLoad.current);
        debouncedLoad.current = null;
      }
      
      // Dispose all models
      if (model) {
        disposeModel(model);
      }
      if (previousModelRef.current) {
        disposeModel(previousModelRef.current);
      }
      
      // Clean up object URLs
      if (objectUrlRef.current) {
        handleObjectUrl(null, objectUrlRef.current);
      }
      
      cleanupActiveResources();
      objectUrlRef.current = null;
      activeSourceRef.current = null;
      
      // Release WebGL context
      webGLContextTracker.releaseContext();
    };
  }, []);

  return { 
    loading, 
    model,
    error
  };
};
