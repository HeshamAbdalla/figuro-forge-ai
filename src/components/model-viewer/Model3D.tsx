
import React, { useRef, useEffect } from "react";
import { Center } from "@react-three/drei";
import LoadingSpinner from "./LoadingSpinner";
import { useModelLoader } from "./hooks/useModelLoader";
import { disposeModel, simplifyModelForPreview } from "./utils/modelUtils";

interface Model3DProps {
  modelSource: string | null;
  modelBlob?: Blob | null;
  onError: (error: any) => void;
  isPreview?: boolean; // Flag to determine if this is a preview mode
}

const Model3D = ({ modelSource, modelBlob, onError, isPreview = false }: Model3DProps) => {
  // Create a stable ID for this model with better uniqueness
  const modelIdRef = useRef<string>(`model3d-${Math.random().toString(36).substring(2, 10)}`);
  const processedModelRef = useRef<THREE.Group | null>(null);
  
  // Extract model name from URL for better logging
  const modelName = modelSource ? modelSource.split('/').pop()?.split('?')[0] || 'unknown-model' : 'blob-model';
  
  console.log(`Loading model: ${modelName}, ID: ${modelIdRef.current}, Preview: ${isPreview}`);
  
  const { loading, model } = useModelLoader({ 
    modelSource, 
    modelBlob,
    modelId: modelIdRef.current,
    onError 
  });

  // Process model for preview if needed
  useEffect(() => {
    if (model) {
      console.log(`Model successfully loaded: ${modelName}`);
      
      // Apply simplification for preview mode
      if (isPreview) {
        console.log(`Applying preview simplification for: ${modelName}`);
        const simplifiedModel = simplifyModelForPreview(model);
        
        // Dispose previous processed model if it exists
        if (processedModelRef.current && processedModelRef.current !== model) {
          disposeModel(processedModelRef.current);
        }
        
        processedModelRef.current = simplifiedModel;
      } else {
        // Dispose previous processed model if switching from preview to full
        if (processedModelRef.current && processedModelRef.current !== model) {
          disposeModel(processedModelRef.current);
        }
        
        processedModelRef.current = model;
      }
    }
  }, [model, modelName, isPreview]);
  
  // Cleanup processed model on unmount
  useEffect(() => {
    return () => {
      if (processedModelRef.current) {
        disposeModel(processedModelRef.current);
        processedModelRef.current = null;
      }
    };
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return processedModelRef.current ? (
    <Center scale={[1.5, 1.5, 1.5]}>
      <primitive object={processedModelRef.current} />
    </Center>
  ) : null;
};

export default Model3D;
