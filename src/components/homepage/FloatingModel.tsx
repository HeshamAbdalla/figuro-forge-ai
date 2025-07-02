
import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { motion } from 'framer-motion-3d';

interface FloatingModelProps {
  id: string;
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  floatAmplitude: number;
  floatSpeed: number;
  color: string;
  modelPath: string;
}

const FloatingModel: React.FC<FloatingModelProps> = ({
  position,
  scale,
  rotationSpeed,
  floatAmplitude,
  floatSpeed,
  color,
  modelPath
}) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Try to load the model, fallback to a simple geometry if it fails
  let gltf;
  try {
    gltf = useLoader(GLTFLoader, modelPath);
  } catch (error) {
    console.warn(`Failed to load model: ${modelPath}`, error);
    gltf = null;
  }

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => {
    setClicked(!clicked);
    // Add click sound effect or other interactions here
  }, [clicked]);

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

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {gltf ? (
        // Render the loaded GLTF model
        <primitive
          object={gltf.scene.clone()}
          scale={1}
          castShadow
          receiveShadow
        />
      ) : (
        // Fallback to a simple colored geometry
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.3}
            roughness={0.4}
            envMapIntensity={0.8}
          />
        </mesh>
      )}
      
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
