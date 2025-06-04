
import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useToast } from '@/hooks/use-toast';
import { loadTextTo3DModelWithFallback, validateTextTo3DModelInfo, type TextTo3DModelInfo } from '@/utils/textTo3DModelUtils';
import { disposeModel } from '@/components/model-viewer/utils/modelUtils';

interface UseTextTo3DModelLoaderProps {
  modelInfo: TextTo3DModelInfo | null;
  onError?: (error: any) => void;
  autoLoad?: boolean;
}

interface UseTextTo3DModelLoaderResult {
  loading: boolean;
  model: THREE.Group | null;
  error: string | null;
  loadModel: () => Promise<void>;
  clearModel: () => void;
  progress: number;
}

export const useTextTo3DModelLoader = ({
  modelInfo,
  onError,
  autoLoad = true
}: UseTextTo3DModelLoaderProps): UseTextTo3DModelLoaderResult => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Refs to track resources and prevent memory leaks
  const isLoadingRef = useRef<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);
  const previousModelRef = useRef<THREE.Group | null>(null);
  const modelInfoRef = useRef<TextTo3DModelInfo | null>(null);
  
  // Clear previous model and resources
  const clearModel = useCallback(() => {
    if (previousModelRef.current) {
      console.log('🗑️ [TEXT-TO-3D-LOADER] Disposing previous model');
      disposeModel(previousModelRef.current);
      previousModelRef.current = null;
    }
    
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    
    setModel(null);
    setError(null);
    setProgress(0);
    setLoading(false);
    isLoadingRef.current = false;
  }, []);
  
  // Load model function
  const loadModel = useCallback(async (): Promise<void> => {
    if (!modelInfo || isLoadingRef.current) {
      return;
    }
    
    console.log('🔄 [TEXT-TO-3D-LOADER] Starting model load for task:', modelInfo.taskId);
    
    // Validate model info
    const validationError = validateTextTo3DModelInfo(modelInfo);
    if (validationError) {
      console.error('❌ [TEXT-TO-3D-LOADER] Validation failed:', validationError);
      setError(validationError);
      if (onError) {
        onError(new Error(validationError));
      }
      return;
    }
    
    // Check if we're trying to load the same model
    if (modelInfoRef.current?.taskId === modelInfo.taskId && 
        modelInfoRef.current?.modelUrl === modelInfo.modelUrl &&
        model) {
      console.log('✅ [TEXT-TO-3D-LOADER] Same model already loaded, skipping');
      return;
    }
    
    // Clear previous resources
    clearModel();
    
    // Set loading state
    setLoading(true);
    setError(null);
    setProgress(0);
    isLoadingRef.current = true;
    modelInfoRef.current = modelInfo;
    
    // Create abort controller
    controllerRef.current = new AbortController();
    
    try {
      const loadedModel = await loadTextTo3DModelWithFallback(
        modelInfo,
        (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            setProgress(percent);
            
            if (percent % 25 === 0) {
              console.log(`📊 [TEXT-TO-3D-LOADER] Loading progress: ${percent.toFixed(0)}%`);
            }
          }
        }
      );
      
      if (controllerRef.current?.signal.aborted) {
        console.log('⚠️ [TEXT-TO-3D-LOADER] Load operation was aborted');
        return;
      }
      
      // Store reference for cleanup
      previousModelRef.current = loadedModel;
      setModel(loadedModel);
      setProgress(100);
      setLoading(false);
      isLoadingRef.current = false;
      
      console.log('✅ [TEXT-TO-3D-LOADER] Model loaded successfully for task:', modelInfo.taskId);
      
    } catch (loadError) {
      if (controllerRef.current?.signal.aborted) {
        console.log('⚠️ [TEXT-TO-3D-LOADER] Error ignored due to abort');
        return;
      }
      
      console.error('❌ [TEXT-TO-3D-LOADER] Failed to load model:', loadError);
      
      const errorMessage = loadError instanceof Error ? loadError.message : 'Failed to load 3D model';
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      isLoadingRef.current = false;
      
      if (onError) {
        onError(loadError);
      }
      
      toast({
        title: "Model Loading Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [modelInfo, onError, toast, clearModel, model]);
  
  // Auto-load effect
  useEffect(() => {
    if (autoLoad && modelInfo && !model && !loading) {
      loadModel();
    }
  }, [autoLoad, modelInfo, loadModel, model, loading]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearModel();
    };
  }, [clearModel]);
  
  return {
    loading,
    model,
    error,
    loadModel,
    clearModel,
    progress
  };
};
