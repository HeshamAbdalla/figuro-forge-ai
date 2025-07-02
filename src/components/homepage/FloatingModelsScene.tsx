
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import FloatingModel from './FloatingModel';
import AtmosphericEffects from './AtmosphericEffects';
import ParticleSystem from './ParticleSystem';

const FloatingModelsScene: React.FC = () => {
  const sceneRef = useRef<Group>(null);

  // Define model configurations
  const modelConfigs = useMemo(() => [
    {
      id: 'model1',
      position: [-3, 2, 0] as [number, number, number],
      scale: 0.8,
      rotationSpeed: 0.5,
      floatAmplitude: 0.3,
      floatSpeed: 1.2,
      color: '#9b87f5',
      modelPath: '/models/figurine1.glb' // Placeholder - will be replaced with actual models
    },
    {
      id: 'model2',
      position: [3, -1, -1] as [number, number, number],
      scale: 1.0,
      rotationSpeed: -0.3,
      floatAmplitude: 0.4,
      floatSpeed: 0.8,
      color: '#f59e0b',
      modelPath: '/models/figurine2.glb'
    },
    {
      id: 'model3',
      position: [0, -2, 1] as [number, number, number],
      scale: 0.6,
      rotationSpeed: 0.7,
      floatAmplitude: 0.2,
      floatSpeed: 1.5,
      color: '#ef4444',
      modelPath: '/models/figurine3.glb'
    },
    {
      id: 'model4',
      position: [-2, -1, -2] as [number, number, number],
      scale: 0.9,
      rotationSpeed: -0.4,
      floatAmplitude: 0.5,
      floatSpeed: 1.0,
      color: '#10b981',
      modelPath: '/models/figurine4.glb'
    },
    {
      id: 'model5',
      position: [2, 2, 2] as [number, number, number],
      scale: 0.7,
      rotationSpeed: 0.6,
      floatAmplitude: 0.3,
      floatSpeed: 1.3,
      color: '#8b5cf6',
      modelPath: '/models/figurine5.glb'
    }
  ], []);

  // Global scene rotation
  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Atmospheric Effects */}
      <AtmosphericEffects />
      
      {/* Particle System */}
      <ParticleSystem />
      
      {/* Floating Models */}
      {modelConfigs.map((config) => (
        <FloatingModel
          key={config.id}
          {...config}
        />
      ))}
    </group>
  );
};

export default FloatingModelsScene;
