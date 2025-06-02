
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { disposeModel } from "../utils/modelUtils";

interface UseOptimizedModelLoaderProps {
  modelSource: string | null;
  modelBlob?: Blob | null;
  visible?: boolean;
  modelId: string;
  priority?: number;
  onError?: (error: any) => void;
}

export const useOptimizedModelLoader = ({
  modelSource,
  modelBlob,
  visible = true,
  modelId,
  priority = 1,
  onError
}: UseOptimizedModelLoaderProps) => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<any>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize optimized loader with DRACO compression
  useEffect(() => {
    const loader = new GLTFLoader();
    
    // Configure DRACO loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    loaderRef.current = loader;
    
    return () => {
      dracoLoader.dispose();
    };
  }, []);

  // Load model with enhanced error handling and optimization
  useEffect(() => {
    if (!visible || (!modelSource && !modelBlob)) {
      return;
    }

    // Abort previous request if still loading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadModel = async () => {
      if (!loaderRef.current) return;

      setLoading(true);
      setError(null);
      
      try {
        let loadPromise: Promise<any>;

        if (modelBlob) {
          // Handle blob loading
          const objectUrl = URL.createObjectURL(modelBlob);
          loadPromise = new Promise((resolve, reject) => {
            loaderRef.current!.load(
              objectUrl,
              resolve,
              undefined,
              reject
            );
          });
        } else if (modelSource) {
          // Handle URL loading with fetch for better control
          const response = await fetch(modelSource, {
            signal: abortController.signal,
            headers: {
              'Accept': 'application/octet-stream, model/gltf-binary, */*'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          loadPromise = new Promise((resolve, reject) => {
            loaderRef.current!.parse(
              arrayBuffer,
              '',
              resolve,
              reject
            );
          });
        } else {
          return;
        }

        const gltf = await loadPromise;

        if (abortController.signal.aborted) {
          return;
        }

        // Optimize the loaded model
        const optimizedModel = optimizeLoadedModel(gltf.scene);
        
        // Dispose previous model
        if (model) {
          disposeModel(model);
        }
        
        setModel(optimizedModel);
        setLoading(false);
        
        console.log(`Optimized model loaded successfully: ${modelId}`);
        
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        
        console.error(`Failed to load model ${modelId}:`, err);
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    };

    // Add delay for lower priority models
    const delay = priority < 1 ? 1000 * (1 - priority) : 0;
    
    const timeoutId = setTimeout(loadModel, delay);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [modelSource, modelBlob, visible, modelId, priority, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (model) {
        disposeModel(model);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { loading, model, error };
};

// Optimize loaded model for better performance
const optimizeLoadedModel = (scene: THREE.Group): THREE.Group => {
  const optimizedScene = scene.clone();
  
  optimizedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Optimize geometry
      if (child.geometry) {
        child.geometry.computeBoundingBox();
        child.geometry.computeBoundingSphere();
        
        // Merge vertices if possible
        if (child.geometry.index) {
          child.geometry = child.geometry.toNonIndexed();
        }
      }
      
      // Optimize materials
      if (child.material instanceof THREE.MeshStandardMaterial) {
        // Reduce texture resolution for preview
        if (child.material.map && child.material.map.image) {
          child.material.map.generateMipmaps = true;
          child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
        }
        
        // Enable frustum culling
        child.frustumCulled = true;
      }
    }
  });
  
  return optimizedScene;
};
