
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';
import { Figurine } from '@/types/figurine';
import { modelManager } from '@/utils/modelManager';

interface FloatingModelProps {
  id: string;
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  floatAmplitude: number;
  floatSpeed: number;
  color: string;
  modelPath: string;
  title: string;
  figurineData?: Figurine;
  isLoading?: boolean;
}

const FloatingModel: React.FC<FloatingModelProps> = ({
  id,
  position,
  scale,
  rotationSpeed,
  floatAmplitude,
  floatSpeed,
  color,
  modelPath,
  title,
  figurineData,
  isLoading = false
}) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load model when component mounts
  useEffect(() => {
    if (modelPath && modelPath.trim() !== '') {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [BACKGROUND-MODEL] Loading model:', title, id);
      
      modelManager.loadModel(modelPath)
        .then((loadedModel) => {
          setModel(loadedModel);
          setLoading(false);
          console.log('✅ [BACKGROUND-MODEL] Model loaded successfully:', title);
        })
        .catch((err) => {
          console.error('❌ [BACKGROUND-MODEL] Failed to load model:', title, err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        });
    }
    
    return () => {
      if (modelPath) {
        modelManager.releaseModel(modelPath);
      }
    };
  }, [modelPath, title, id]);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);

  // Subtle background animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Gentle floating motion
    groupRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.position.x = position[0] + Math.cos(time * floatSpeed * 0.5) * 0.2;
    
    // Slow rotation
    groupRef.current.rotation.y += rotationSpeed * 0.016;
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    
    // Subtle breathing effect
    const breathScale = 1 + Math.sin(time * 1.5) * 0.05;
    const hoverScale = hovered ? 1.1 : 1; // Subtle hover effect
    const finalScale = scale * breathScale * hoverScale;
    
    groupRef.current.scale.setScalar(finalScale);
  });

  // Render model with background-appropriate materials
  const renderModel = () => {
    if (isLoading || loading) {
      return (
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.6}
            transparent
            opacity={0.6}
          />
        </mesh>
      );
    }

    if (model && !error) {
      return (
        <primitive
          object={model}
          scale={1.2}
          castShadow
          receiveShadow
        />
      );
    }

    // Background fallback geometry
    return (
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1]} />
        <meshStandardMaterial
          color={error ? '#ff6666' : color}
          metalness={0.2}
          roughness={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>
    );
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {renderModel()}
      
      {/* Subtle glow effect for background */}
      {hovered && (
        <mesh scale={1.5}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

export default FloatingModel;
