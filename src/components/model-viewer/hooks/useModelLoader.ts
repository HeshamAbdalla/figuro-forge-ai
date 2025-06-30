
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useToast } from "@/hooks/use-toast";
import { loadModelWithFallback, createObjectUrl, revokeObjectUrl } from "../utils/modelLoaderUtils";
import { cleanupResources } from "../utils/resourceManager";
import { modelQueueManager } from "../utils/modelQueueManager";
import { disposeModel, handleObjectUrl } from "../utils/modelUtils";

interface UseModelLoaderProps {
  modelSource: string | null;
  modelBlob?: Blob | null;
  onError: (error: any) => void;
  modelId?: string;
}

export const useModelLoader = ({ 
  modelSource, 
  modelBlob, 
  onError,
  modelId: providedModelId 
}: UseModelLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { toast } = useToast();
  
  // Refs to track resources and prevent memory leaks
  const isLoadingRef = useRef<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const previousModelRef = useRef<THREE.Group | null>(null);
  const modelIdRef = useRef<string>(
    providedModelId || `modelloader-${Math.random().toString(36).substring(2, 10)}`
  );
  
  // Track current source to prevent infinite loops - FIXED: Remove model dependency
  const currentSourceRef = useRef<string | Blob | null>(null);
  const loadAttemptRef = useRef<number>(0);
  const lastLoadedSourceRef = useRef<string | Blob | null>(null);

  useEffect(() => {
    console.log(`useModelLoader: Effect triggered for ${modelIdRef.current}`);
    
    // Skip effect if no source provided
    if (!modelSource && !modelBlob) {
      console.log(`No model source provided for ${modelIdRef.current}, skipping load`);
      setLoading(false);
      return;
    }
    
    // Determine the new source
    const newSource = modelBlob || modelSource;
    const sourceKey = modelBlob ? `blob-${Date.now()}` : modelSource;
    
    // CRITICAL FIX: Check against lastLoadedSourceRef instead of model state
    if (sourceKey === lastLoadedSourceRef.current) {
      console.log(`Same model source already loaded for ${modelIdRef.current}, skipping reload`);
      return;
    }
    
    // Reset load attempts for new source
    if (sourceKey !== currentSourceRef.current) {
      loadAttemptRef.current = 0;
      currentSourceRef.current = sourceKey;
    }
    
    // Limit load attempts to prevent infinite loops
    if (loadAttemptRef.current >= 3) {
      console.error(`Too many load attempts for ${modelIdRef.current}, aborting`);
      setLoading(false);
      onError(new Error("Too many load attempts - please try refreshing the page"));
      return;
    }
    
    loadAttemptRef.current += 1;
    console.log(`Load attempt ${loadAttemptRef.current} for ${modelIdRef.current}`);
    
    // Abort previous load if in progress
    if (controllerRef.current) {
      console.log(`Aborting previous load operation for ${modelIdRef.current}`);
      controllerRef.current.abort();
      modelQueueManager.abortModelLoad(modelIdRef.current);
    }
    
    // Dispose previous model before loading new one
    if (previousModelRef.current) {
      console.log(`Disposing previous model for ${modelIdRef.current}`);
      disposeModel(previousModelRef.current);
      previousModelRef.current = null;
    }
    
    // Clean up previous model resources without disposing current model
    if (objectUrlRef.current && modelBlob) {
      revokeObjectUrl(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    
    // Create a new abort controller for this load operation
    controllerRef.current = new AbortController();
    
    // Set loading state
    setLoading(true);
    isLoadingRef.current = true;
    
    const loadModel = async () => {
      try {
        let modelUrl: string;
        
        // Handle different source types with proper object URL management
        if (modelBlob) {
          // Use handleObjectUrl to properly manage object URLs
          objectUrlRef.current = handleObjectUrl(modelBlob, objectUrlRef.current);
          modelUrl = objectUrlRef.current!;
          console.log(`Created object URL for ${modelIdRef.current}: ${modelUrl}`);
        } else if (typeof modelSource === 'string') {
          // It's a URL string
          modelUrl = modelSource;
          console.log(`Loading from URL string for ${modelIdRef.current}: ${modelUrl}`);
        } else {
          console.log(`Invalid model source for ${modelIdRef.current}`);
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }
        
        // Queue the model load
        const loadedModel = await modelQueueManager.queueModelLoad(
          modelIdRef.current,
          () => loadModelWithFallback(modelUrl, {
            signal: controllerRef.current?.signal,
            onProgress: (progress) => {
              // Optional progress tracking
              const percent = Math.round((progress.loaded / progress.total) * 100);
              if (percent % 25 === 0) { // Log only at 0%, 25%, 50%, 75%, 100%
                console.log(`Loading progress for ${modelIdRef.current}: ${percent}%`);
              }
            }
          })
        );
        
        if (controllerRef.current?.signal.aborted) {
          console.log(`Load operation was aborted for ${modelIdRef.current}`);
          return;
        }
        
        // Store reference to previous model for proper disposal
        previousModelRef.current = loadedModel;
        setModel(loadedModel);
        setLoading(false);
        isLoadingRef.current = false;
        
        // CRITICAL: Mark this source as successfully loaded
        lastLoadedSourceRef.current = sourceKey;
        loadAttemptRef.current = 0; // Reset counter on success
        
        console.log(`Model ${modelIdRef.current} loaded successfully`);
        
      } catch (error) {
        if (controllerRef.current?.signal.aborted) {
          console.log(`Error ignored due to abort for ${modelIdRef.current}`);
          return;
        }
        
        console.error(`Failed to load model ${modelIdRef.current}:`, error);
        onError(error);
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
    
    loadModel();
    
    // Cleanup function
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      
      // Don't dispose the model here - let the component using it handle disposal
      // Just clean up the controller and URL
      if (objectUrlRef.current && modelBlob) {
        revokeObjectUrl(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [modelSource, modelBlob, onError]); // REMOVED model dependency to prevent infinite loops
  
  // Clean up all resources when unmounting
  useEffect(() => {
    return () => {
      // Dispose current and previous models
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
      
      cleanupResources(model, objectUrlRef.current, controllerRef.current);
      console.log(`Cleaned up resources on unmount for ${modelIdRef.current}`);
    };
  }, []); // Empty dependency array for cleanup
  
  return { loading, model };
};
