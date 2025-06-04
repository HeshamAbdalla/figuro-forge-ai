import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, Html } from "@react-three/drei";
import * as THREE from "three";
import { useModelLoader } from "@/hooks/useModelLoader";
import { disposeModel } from "./utils/modelUtils";

interface EnhancedModelSceneProps {
  modelUrl: string | null;
  modelBlob?: Blob | null;
  autoRotate?: boolean;
  showWireframe?: boolean;
  onModelError?: (error: any) => void;
  preloadedModel?: THREE.Group | null; // New prop for preloaded models
}

const EnhancedModelScene: React.FC<EnhancedModelSceneProps> = ({
  modelUrl,
  modelBlob,
  autoRotate = true,
  showWireframe = false,
  onModelError,
  preloadedModel
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelToRender, setModelToRender] = useState<THREE.Group | null>(null);
  const previousModelRef = useRef<THREE.Group | null>(null);
  const { scene } = useThree();

  // Use the regular model loader only if we don't have a preloaded model
  const { loading, model, error, loadModel } = useModelLoader();

  // Handle model loading logic
  useEffect(() => {
    // Clear previous model
    if (previousModelRef.current) {
      console.log("🗑️ [ENHANCED-MODEL-SCENE] Disposing previous model");
      disposeModel(previousModelRef.current);
      previousModelRef.current = null;
    }

    // Use preloaded model if available (for text-to-3D)
    if (preloadedModel) {
      console.log("✅ [ENHANCED-MODEL-SCENE] Using preloaded text-to-3D model");
      const clonedModel = preloadedModel.clone();
      setModelToRender(clonedModel);
      previousModelRef.current = clonedModel;
      return;
    }

    // Otherwise, load model using the regular loader
    if (modelBlob) {
      console.log("🔄 [ENHANCED-MODEL-SCENE] Loading model from blob");
      const blobUrl = URL.createObjectURL(modelBlob);
      loadModel(blobUrl);
    } else if (modelUrl) {
      console.log("🔄 [ENHANCED-MODEL-SCENE] Loading model from URL:", modelUrl);
      loadModel(modelUrl);
    } else {
      setModelToRender(null);
    }
  }, [modelUrl, modelBlob, preloadedModel, loadModel]);

  // Update model to render when regular loader completes
  useEffect(() => {
    if (model && !preloadedModel) {
      console.log("✅ [ENHANCED-MODEL-SCENE] Using regular loaded model");
      setModelToRender(model);
      previousModelRef.current = model;
    }
  }, [model, preloadedModel]);

  // Handle errors
  useEffect(() => {
    if (error && onModelError) {
      console.error("❌ [ENHANCED-MODEL-SCENE] Model loading error:", error);
      onModelError(error);
    }
  }, [error, onModelError]);

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate && modelToRender) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Apply wireframe material if requested
  useEffect(() => {
    if (modelToRender) {
      modelToRender.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (showWireframe) {
            child.material = new THREE.MeshBasicMaterial({
              wireframe: true,
              color: 0x00ff00
            });
          } else {
            // Reset to original material if possible
            // This is a simplified approach - in production you'd want to store original materials
            if (child.material instanceof THREE.MeshBasicMaterial && child.material.wireframe) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff
              });
            }
          }
        }
      });
    }
  }, [modelToRender, showWireframe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousModelRef.current) {
        disposeModel(previousModelRef.current);
        previousModelRef.current = null;
      }
    };
  }, []);

  // Loading state
  if (loading && !preloadedModel) {
    return (
      <Html center>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading model...</p>
        </div>
      </Html>
    );
  }

  // Error state
  if (error && !preloadedModel) {
    return (
      <Html center>
        <div className="text-center text-red-400">
          <p className="text-lg mb-2">Failed to Load Model</p>
          <p className="text-sm text-red-300">
            {typeof error === 'string' ? error : 'Unknown error occurred'}
          </p>
        </div>
      </Html>
    );
  }

  // No model state
  if (!modelToRender) {
    return (
      <Html center>
        <div className="text-center text-white/70">
          <p className="text-lg">No Model Available</p>
          <p className="text-sm">Upload a model or generate one to preview</p>
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      <Center scale={[1.5, 1.5, 1.5]}>
        <primitive object={modelToRender} />
      </Center>
    </group>
  );
};

export default EnhancedModelScene;
