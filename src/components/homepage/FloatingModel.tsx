
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useModelLoader } from '@/hooks/useModelLoader';
import { Figurine } from '@/types/figurine';

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
  
  // Use the model loader hook only if we have a model path
  const { loading: modelLoading, model, error } = useModelLoader();

  // Load model when component mounts and modelPath is available
  React.useEffect(() => {
    if (modelPath && modelPath.trim() !== '') {
      console.log('🔄 [FLOATING-MODEL] Loading model:', title, modelPath.substring(0, 50) + '...');
      loadModel(modelPath);
    }
  }, [modelPath]);

  const { loadModel } = useModelLoader();

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => {
    setClicked(!clicked);
    
    // If we have figurine data, we could navigate to a detail view
    if (figurineData) {
      console.log('🎯 [FLOATING-MODEL] Clicked model:', figurineData.title || title);
      // Could implement navigation to model viewer here
      // Example: navigate(`/model/${figurineData.id}`);
    }
  }, [clicked, figurineData, title]);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Floating motion
    groupRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;
    
    // Rotation
    groupRef.current.rotation.y += rotationSpeed * 0.016; // ~60fps
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
    if (isLoading || (modelPath && modelLoading)) {
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            envMapIntensity={0.8}
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
          object={model.clone()}
          scale={1}
          castShadow
          receiveShadow
        />
      );
    }

    // Fallback to colored geometry (for errors or no model path)
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={0.8}
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
      
      {/* Loading indicator for model loading */}
      {modelPath && modelLoading && (
        <mesh position={[0, 1.5, 0]} scale={0.3}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

export default FloatingModel;
