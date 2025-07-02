
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
  
  // Load model when component mounts
  useEffect(() => {
    if (modelPath && modelPath.trim() !== '') {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [SHOWCASE-MODEL] Loading model:', title, id);
      
      modelManager.loadModel(modelPath)
        .then((loadedModel) => {
          setModel(loadedModel);
          setLoading(false);
          console.log('✅ [SHOWCASE-MODEL] Model loaded successfully:', title);
        })
        .catch((err) => {
          console.error('❌ [SHOWCASE-MODEL] Failed to load model:', title, err);
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
  const handleClick = useCallback(() => {
    setClicked(!clicked);
    if (figurineData) {
      console.log('🎯 [SHOWCASE-MODEL] Interactive model clicked:', figurineData.title || title);
    }
  }, [clicked, figurineData, title]);

  // Enhanced animation for dramatic "popping out" effect
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Enhanced floating motion with more dramatic Z movement
    groupRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.position.z = position[2] + Math.sin(time * floatSpeed * 0.7) * 1.2; // More pronounced forward/backward
    groupRef.current.position.x = position[0] + Math.cos(time * floatSpeed * 0.3) * 0.3; // Slight side movement
    
    // More dynamic rotation
    groupRef.current.rotation.y += rotationSpeed * 0.016;
    groupRef.current.rotation.x = Math.sin(time * 0.7) * 0.15;
    groupRef.current.rotation.z = Math.cos(time * 0.4) * 0.08;
    
    // Enhanced breathing and interaction effects
    const breathScale = 1 + Math.sin(time * 2.5) * 0.12; // More pronounced breathing
    const hoverScale = hovered ? 1.5 : 1; // Bigger hover effect
    const clickScale = clicked ? 0.8 : 1;
    const finalScale = scale * breathScale * hoverScale * clickScale;
    
    groupRef.current.scale.setScalar(finalScale);
  });

  // Render model with enhanced fallbacks
  const renderModel = () => {
    if (isLoading || loading) {
      return (
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[1.4]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.2}
            transparent
            opacity={0.8}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
      );
    }

    if (model && !error) {
      return (
        <primitive
          object={model}
          scale={1.5}
          castShadow
          receiveShadow
        />
      );
    }

    // Enhanced fallback geometry
    return (
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1.2]} />
        <meshStandardMaterial
          color={error ? '#ff4444' : color}
          metalness={0.5}
          roughness={0.3}
          emissive={error ? '#ff2222' : color}
          emissiveIntensity={0.15}
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
      
      {/* Enhanced glow effect */}
      {hovered && (
        <mesh scale={2.2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* Enhanced particle trail */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              0, 0, 0, 
              0.8, 0.8, -0.8, 
              -0.8, -0.8, 0.8,
              0.5, -0.5, 0.5,
              -0.5, 0.5, -0.5
            ])}
            count={5}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={color}
          transparent
          opacity={0.7}
        />
      </points>
    </group>
  );
};

export default FloatingModel;
