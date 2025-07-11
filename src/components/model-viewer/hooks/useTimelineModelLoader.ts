import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { modelManager } from "@/utils/modelManager";

interface UseTimelineModelLoaderProps {
  modelUrl: string | null;
  modelId: string;
  priority?: number;
}

/**
 * Optimized model loader specifically for timeline nodes
 * Designed to handle multiple concurrent loads efficiently
 */
export const useTimelineModelLoader = ({ 
  modelUrl, 
  modelId,
  priority = 0
}: UseTimelineModelLoaderProps) => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track state and prevent memory leaks
  const loadingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Skip if no URL or if URL hasn't changed
    if (!modelUrl || modelUrl === currentUrlRef.current) {
      return;
    }

    // Skip if already loading the same URL
    if (loadingRef.current && modelUrl === currentUrlRef.current) {
      return;
    }

    // Abort any previous load
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Update refs
    currentUrlRef.current = modelUrl;
    loadingRef.current = true;
    abortControllerRef.current = new AbortController();

    // Set loading state
    setLoading(true);
    setError(null);

    const loadModel = async () => {
      try {
        console.log(`[TIMELINE-LOADER] Loading model ${modelId} from ${modelUrl.substring(0, 50)}...`);
        
        // Use the optimized model manager
        const loadedModel = await modelManager.loadModel(modelUrl);
        
        // Check if component is still mounted and this is still the current load
        if (!mountedRef.current || abortControllerRef.current?.signal.aborted) {
          return;
        }

        // Set the loaded model
        setModel(loadedModel);
        setLoading(false);
        loadingRef.current = false;
        
        console.log(`[TIMELINE-LOADER] Successfully loaded model ${modelId}`);
        
      } catch (error) {
        // Check if this was an abort or if component was unmounted
        if (!mountedRef.current || abortControllerRef.current?.signal.aborted) {
          return;
        }

        console.error(`[TIMELINE-LOADER] Failed to load model ${modelId}:`, error);
        setError(error instanceof Error ? error.message : 'Failed to load model');
        setLoading(false);
        loadingRef.current = false;
      }
    };

    // Start loading with a small delay to prevent overwhelming
    const timeoutId = setTimeout(loadModel, priority > 0 ? 0 : 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      loadingRef.current = false;
    };
  }, [modelUrl, modelId, priority]);

  // Cleanup effect for model disposal
  useEffect(() => {
    return () => {
      if (model && currentUrlRef.current) {
        modelManager.releaseModel(currentUrlRef.current);
      }
    };
  }, [model]);

  return { loading, model, error };
};