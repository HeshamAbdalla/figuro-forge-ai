
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

  // Enhanced fallback configurations for foreground effect
  const fallbackConfigs = useMemo(() => [
    {
      id: 'foreground1',
      position: [-4, 3, 2] as [number, number, number], // Closer to camera
      scale: 1.2,
      rotationSpeed: 0.4,
      floatAmplitude: 0.4,
      floatSpeed: 1.1,
      color: '#9b87f5'
    },
    {
      id: 'foreground2',
      position: [4, -2, 3] as [number, number, number], // Even closer
      scale: 1.4,
      rotationSpeed: -0.3,
      floatAmplitude: 0.5,
      floatSpeed: 0.9,
      color: '#f59e0b'
    },
    {
      id: 'foreground3',
      position: [0, -3, 4] as [number, number, number], // Closest
      scale: 1.0,
      rotationSpeed: 0.6,
      floatAmplitude: 0.3,
      floatSpeed: 1.4,
      color: '#ef4444'
    },
    {
      id: 'foreground4',
      position: [-3, -1, 1] as [number, number, number],
      scale: 0.9,
      rotationSpeed: -0.5,
      floatAmplitude: 0.6,
      floatSpeed: 1.2,
      color: '#10b981'
    },
    {
      id: 'foreground5',
      position: [3, 2, 1.5] as [number, number, number],
      scale: 1.1,
      rotationSpeed: 0.7,
      floatAmplitude: 0.4,
      floatSpeed: 1.3,
      color: '#8b5cf6'
    }
  ], []);

  // Enhanced global scene animation
  useFrame((state) => {
    if (sceneRef.current) {
      const time = state.clock.elapsedTime;
      // Subtle scene rotation for dynamic foreground effect
      sceneRef.current.rotation.y = Math.sin(time * 0.08) * 0.03;
      sceneRef.current.rotation.x = Math.cos(time * 0.06) * 0.02;
    }
  });

  // Memoized model rendering with enhanced configurations
  const renderModels = useMemo(() => {
    if (loading) {
      // Show loading placeholders with foreground positioning
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
      // Show enhanced fallback geometric shapes
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
          title="AI Generated 3D Model"
        />
      ));
    }

    // Render real models with enhanced foreground positioning
    return models.map((model, index) => {
      const config = fallbackConfigs[index % fallbackConfigs.length];
      return (
        <FloatingModel
          key={`model-${model.id}`}
          id={model.id}
          position={config.position} // Use enhanced positions
          scale={config.scale} // Use enhanced scales
          rotationSpeed={model.rotationSpeed}
          floatAmplitude={model.floatAmplitude}
          floatSpeed={model.floatSpeed}
          color={model.color}
          modelPath={model.model_url || ''}
          title={model.title || 'Community 3D Model'}
          figurineData={model}
        />
      );
    });
  }, [loading, error, models, fallbackConfigs]);

  return (
    <group ref={sceneRef}>
      {/* Enhanced Atmospheric Effects for foreground */}
      <AtmosphericEffects />
      
      {/* Enhanced Particle System */}
      <ParticleSystem />
      
      {/* Floating Models positioned for foreground effect */}
      {renderModels}
    </group>
  );
};

export default FloatingModelsScene;
