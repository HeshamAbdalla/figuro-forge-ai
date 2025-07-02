
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
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
  const [clicked, setClicked] = useState(false);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load model when component mounts and modelPath is available
  useEffect(() => {
    if (modelPath && modelPath.trim() !== '') {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [FLOATING-MODEL] Loading model:', title, id);
      
      modelManager.loadModel(modelPath)
        .then((loadedModel) => {
          setModel(loadedModel);
          setLoading(false);
          console.log('✅ [FLOATING-MODEL] Model loaded:', title, id);
        })
        .catch((err) => {
          console.error('❌ [FLOATING-MODEL] Failed to load model:', title, id, err);
          setError(err.message);
          setLoading(false);
        });
    }
    
    // Cleanup function to release model reference
    return () => {
      if (modelPath) {
        modelManager.releaseModel(modelPath);
      }
    };
  }, [modelPath, title, id]);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => {
    setClicked(!clicked);
    
    if (figurineData) {
      console.log('🎯 [FLOATING-MODEL] Clicked model:', figurineData.title || title);
    }
  }, [clicked, figurineData, title]);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Floating motion
    groupRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;
    
    // Rotation
    groupRef.current.rotation.y += rotationSpeed * 0.016;
    groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    
    // Breathing scale effect
    const breathScale = 1 + Math.sin(time * 2) * 0.05;
    const hoverScale = hovered ? 1.2 : 1;
    const clickScale = clicked ? 0.9 : 1;
    const finalScale = scale * breathScale * hoverScale * clickScale;
    
    groupRef.current.scale.setScalar(finalScale);
  });

  // Determine what to render
  const renderModel = () => {
    // Show loading state
    if (isLoading || loading) {
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>
      );
    }

    // Show loaded 3D model
    if (model && !error) {
      return (
        <primitive
          object={model}
          scale={1}
          castShadow
          receiveShadow
        />
      );
    }

    // Fallback geometry for errors or no model path
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={error ? '#ff4444' : color}
          metalness={0.3}
          roughness={0.4}
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
      onClick={handleClick}
    >
      {renderModel()}
      
      {/* Glow effect when hovered */}
      {hovered && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.8, 16, 16]} />
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
