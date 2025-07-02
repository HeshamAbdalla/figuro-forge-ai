
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import FloatingModel from './FloatingModel';
import AtmosphericEffects from './AtmosphericEffects';
import ParticleSystem from './ParticleSystem';
import { useShowcaseModels } from '@/hooks/useShowcaseModels';

const FloatingModelsScene: React.FC = () => {
  const sceneRef = useRef<Group>(null);
  const { models, loading, error } = useShowcaseModels();

  // Memoized fallback configurations to prevent recreating on each render
  const fallbackConfigs = useMemo(() => [
    {
      id: 'fallback1',
      position: [-3, 2, 0] as [number, number, number],
      scale: 0.8,
      rotationSpeed: 0.5,
      floatAmplitude: 0.3,
      floatSpeed: 1.2,
      color: '#9b87f5'
    },
    {
      id: 'fallback2',
      position: [3, -1, -1] as [number, number, number],
      scale: 1.0,
      rotationSpeed: -0.3,
      floatAmplitude: 0.4,
      floatSpeed: 0.8,
      color: '#f59e0b'
    },
    {
      id: 'fallback3',
      position: [0, -2, 1] as [number, number, number],
      scale: 0.6,
      rotationSpeed: 0.7,
      floatAmplitude: 0.2,
      floatSpeed: 1.5,
      color: '#ef4444'
    }
  ], []);

  // Global scene rotation with reduced frequency
  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  // Memoized model rendering to prevent unnecessary re-renders
  const renderModels = useMemo(() => {
    if (loading) {
      // Show loading placeholders
      return fallbackConfigs.map((config) => (
        <FloatingModel
          key={`loading-${config.id}`}
          id={`loading-${config.id}`}
          position={config.position}
          scale={config.scale}
          rotationSpeed={config.rotationSpeed}
          floatAmplitude={config.floatAmplitude}
          floatSpeed={config.floatSpeed}
          color={config.color}
          modelPath=""
          title="Loading..."
          isLoading={true}
        />
      ));
    }

    if (error || models.length === 0) {
      console.warn('⚠️ [FLOATING-MODELS-SCENE] Using fallback models:', error || 'No models available');
      // Show fallback geometric shapes
      return fallbackConfigs.map((config) => (
        <FloatingModel
          key={`fallback-${config.id}`}
          id={`fallback-${config.id}`}
          position={config.position}
          scale={config.scale}
          rotationSpeed={config.rotationSpeed}
          floatAmplitude={config.floatAmplitude}
          floatSpeed={config.floatSpeed}
          color={config.color}
          modelPath=""
          title="Sample 3D Model"
        />
      ));
    }

    // Render real models with unique keys to prevent unnecessary re-renders
    return models.map((model) => (
      <FloatingModel
        key={`model-${model.id}`}
        id={model.id}
        position={model.position}
        scale={model.scale}
        rotationSpeed={model.rotationSpeed}
        floatAmplitude={model.floatAmplitude}
        floatSpeed={model.floatSpeed}
        color={model.color}
        modelPath={model.model_url || ''}
        title={model.title || 'Untitled Model'}
        figurineData={model}
      />
    ));
  }, [loading, error, models, fallbackConfigs]);

  return (
    <group ref={sceneRef}>
      {/* Atmospheric Effects */}
      <AtmosphericEffects />
      
      {/* Particle System with reduced particle count for better performance */}
      <ParticleSystem />
      
      {/* Floating Models */}
      {renderModels}
    </group>
  );
};

export default FloatingModelsScene;
