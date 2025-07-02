
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
          setError(err instanceof Error ? err.message : 'Unknown error');
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

  // Animation loop with enhanced "popping out" effect
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Enhanced floating motion with forward movement
    groupRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.position.z = position[2] + Math.sin(time * floatSpeed * 0.5) * 0.5; // Forward/backward motion
    
    // Dynamic rotation
    groupRef.current.rotation.y += rotationSpeed * 0.016;
    groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    groupRef.current.rotation.z = Math.cos(time * 0.3) * 0.05;
    
    // Enhanced breathing scale effect
    const breathScale = 1 + Math.sin(time * 2) * 0.08;
    const hoverScale = hovered ? 1.3 : 1;
    const clickScale = clicked ? 0.85 : 1;
    const finalScale = scale * breathScale * hoverScale * clickScale;
    
    groupRef.current.scale.setScalar(finalScale);
  });

  // Determine what to render
  const renderModel = () => {
    // Show loading state
    if (isLoading || loading) {
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color={color}
            metalness={0.4}
            roughness={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      );
    }

    // Show loaded 3D model
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

    // Fallback geometry for errors or no model path
    return (
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial
          color={error ? '#ff4444' : color}
          metalness={0.4}
          roughness={0.3}
          emissive={error ? '#ff2222' : color}
          emissiveIntensity={0.1}
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
      
      {/* Enhanced glow effect when hovered */}
      {hovered && (
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
      
      {/* Particle trail effect */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, 0, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5])}
            count={3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={color}
          transparent
          opacity={0.6}
        />
      </points>
    </group>
  );
};

export default FloatingModel;
