
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

  // Enhanced foreground positioning for dramatic "popping out" effect
  const showcaseConfigs = useMemo(() => [
    {
      id: 'showcase1',
      position: [-6, 4, 6] as [number, number, number], // Far left, high, very close
      scale: 1.8,
      rotationSpeed: 0.3,
      floatAmplitude: 0.6,
      floatSpeed: 1.0,
      color: '#9b87f5'
    },
    {
      id: 'showcase2',
      position: [6, -3, 8] as [number, number, number], // Far right, low, closest
      scale: 2.2,
      rotationSpeed: -0.4,
      floatAmplitude: 0.8,
      floatSpeed: 0.8,
      color: '#f59e0b'
    },
    {
      id: 'showcase3',
      position: [0, -4, 5] as [number, number, number], // Center, very low, close
      scale: 1.5,
      rotationSpeed: 0.5,
      floatAmplitude: 0.4,
      floatSpeed: 1.4,
      color: '#ef4444'
    },
    {
      id: 'showcase4',
      position: [-4, -1, 3] as [number, number, number], // Left, center, medium close
      scale: 1.3,
      rotationSpeed: -0.6,
      floatAmplitude: 0.7,
      floatSpeed: 1.1,
      color: '#10b981'
    },
    {
      id: 'showcase5',
      position: [4, 3, 4] as [number, number, number], // Right, high, close
      scale: 1.6,
      rotationSpeed: 0.8,
      floatAmplitude: 0.5,
      floatSpeed: 1.3,
      color: '#8b5cf6'
    }
  ], []);

  // Enhanced global scene animation for dynamic effect
  useFrame((state) => {
    if (sceneRef.current) {
      const time = state.clock.elapsedTime;
      // More pronounced scene movement for dramatic effect
      sceneRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
      sceneRef.current.rotation.x = Math.cos(time * 0.08) * 0.03;
      sceneRef.current.position.z = Math.sin(time * 0.15) * 0.3; // Forward/backward movement
    }
  });

  // Render models with enhanced showcase positioning
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
      console.warn('⚠️ [SHOWCASE-SCENE] Using enhanced fallback models:', error || 'No models available');
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

    // Render real models with dramatic positioning
    return models.slice(0, 3).map((model, index) => {
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
      {/* Enhanced atmospheric effects */}
      <AtmosphericEffects />
      
      {/* Enhanced particle system */}
      <ParticleSystem />
      
      {/* Showcase models positioned for dramatic foreground effect */}
      {renderModels}
    </group>
  );
};

export default FloatingModelsScene;
