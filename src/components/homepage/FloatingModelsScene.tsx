
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

  // Expanded background positioning configurations for 8 models
  const showcaseConfigs = useMemo(() => [
    {
      id: 'showcase1',
      position: [-4, 2, -5] as [number, number, number],
      scale: 1.2,
      rotationSpeed: 0.2,
      floatAmplitude: 0.4,
      floatSpeed: 0.8,
      color: '#9b87f5'
    },
    {
      id: 'showcase2',
      position: [4, -2, -8] as [number, number, number],
      scale: 1.5,
      rotationSpeed: -0.25,
      floatAmplitude: 0.5,
      floatSpeed: 0.6,
      color: '#f59e0b'
    },
    {
      id: 'showcase3',
      position: [0, -3, -6] as [number, number, number],
      scale: 1.0,
      rotationSpeed: 0.3,
      floatAmplitude: 0.3,
      floatSpeed: 1.0,
      color: '#ef4444'
    },
    {
      id: 'showcase4',
      position: [-3, 0, -7] as [number, number, number],
      scale: 0.9,
      rotationSpeed: -0.35,
      floatAmplitude: 0.4,
      floatSpeed: 0.9,
      color: '#10b981'
    },
    {
      id: 'showcase5',
      position: [3, 2, -4] as [number, number, number],
      scale: 1.1,
      rotationSpeed: 0.4,
      floatAmplitude: 0.35,
      floatSpeed: 1.1,
      color: '#8b5cf6'
    },
    // New showcase configurations
    {
      id: 'showcase6',
      position: [-5, -1, -3] as [number, number, number],
      scale: 1.3,
      rotationSpeed: -0.15,
      floatAmplitude: 0.45,
      floatSpeed: 0.7,
      color: '#06b6d4'
    },
    {
      id: 'showcase7',
      position: [5, 1, -9] as [number, number, number],
      scale: 0.8,
      rotationSpeed: 0.5,
      floatAmplitude: 0.3,
      floatSpeed: 1.2,
      color: '#ec4899'
    },
    {
      id: 'showcase8',
      position: [0, 4, -5] as [number, number, number],
      scale: 1.0,
      rotationSpeed: -0.3,
      floatAmplitude: 0.35,
      floatSpeed: 0.85,
      color: '#f97316'
    }
  ], []);

  // Gentle scene animation for background effect
  useFrame((state) => {
    if (sceneRef.current) {
      const time = state.clock.elapsedTime;
      // Subtle scene movement
      sceneRef.current.rotation.y = Math.sin(time * 0.05) * 0.02;
      sceneRef.current.rotation.x = Math.cos(time * 0.04) * 0.015;
    }
  });

  // Render models with background positioning - now handles up to 8 models
  const renderModels = useMemo(() => {
    if (loading) {
      return showcaseConfigs.map((config) => (
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
          title="Loading AI Model..."
          isLoading={true}
        />
      ));
    }

    if (error || models.length === 0) {
      console.warn('⚠️ [SHOWCASE-SCENE] Using background fallback models:', error || 'No models available');
      return showcaseConfigs.map((config) => (
        <FloatingModel
          key={`showcase-${config.id}`}
          id={`showcase-${config.id}`}
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

    // Render real models in background positions - now up to 6 models
    return models.slice(0, 6).map((model, index) => {
      const config = showcaseConfigs[index];
      return (
        <FloatingModel
          key={`showcase-model-${model.id}`}
          id={model.id}
          position={config.position}
          scale={config.scale}
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
  }, [loading, error, models, showcaseConfigs]);

  return (
    <group ref={sceneRef}>
      {/* Background atmospheric effects */}
      <AtmosphericEffects />
      
      {/* Subtle particle system */}
      <ParticleSystem />
      
      {/* Background models */}
      {renderModels}
    </group>
  );
};

export default FloatingModelsScene;
