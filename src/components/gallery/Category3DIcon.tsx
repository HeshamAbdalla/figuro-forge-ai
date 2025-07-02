
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';

interface Category3DIconProps {
  category: string;
  color: string;
  isHovered?: boolean;
}

// Simple 3D shapes for each category
const CategoryMesh: React.FC<{ category: string; color: string; isHovered: boolean }> = ({ 
  category, 
  color, 
  isHovered 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create geometry based on category
  const geometry = useMemo(() => {
    switch (category) {
      case 'all':
        return new THREE.SphereGeometry(0.8, 16, 12);
      case 'text-to-3d':
        return new THREE.ConeGeometry(0.7, 1.4, 8);
      case 'traditional':
        return new THREE.BoxGeometry(1.2, 1.2, 1.2);
      case 'popular':
        return new THREE.OctahedronGeometry(0.9);
      case 'liked':
        return new THREE.TetrahedronGeometry(1.0);
      case 'newest':
        return new THREE.CylinderGeometry(0.8, 0.8, 1.0, 8);
      default:
        return new THREE.SphereGeometry(0.8, 16, 12);
    }
  }, [category]);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(color).multiplyScalar(0.1),
    });
  }, [color]);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const hoverScale = isHovered ? 1.1 : 1.0;
      
      // Gentle rotation
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      // Scale animation
      meshRef.current.scale.setScalar(hoverScale);
      
      // Float animation
      meshRef.current.position.y = Math.sin(time * 1.5) * 0.1;
    }
  });

  return (
    <Center>
      <mesh ref={meshRef} geometry={geometry} material={material} />
    </Center>
  );
};

const Category3DIcon: React.FC<Category3DIconProps> = ({ category, color, isHovered = false }) => {
  return (
    <div className="w-12 h-12">
      <Canvas
        gl={{
          powerPreference: "low-power",
          antialias: false,
          alpha: true,
        }}
        dpr={[0.5, 1]}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={0.8} />
        
        <CategoryMesh 
          category={category} 
          color={color}
          isHovered={isHovered}
        />
      </Canvas>
    </div>
  );
};

export default Category3DIcon;
