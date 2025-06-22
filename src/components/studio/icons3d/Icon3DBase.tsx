
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface Icon3DBaseProps {
  children: React.ReactNode;
  autoRotate?: boolean;
  rotationSpeed?: number;
  scale?: number;
  color?: string;
}

const Icon3DBase: React.FC<Icon3DBaseProps> = ({
  children,
  autoRotate = true,
  rotationSpeed = 1,
  scale = 1,
  color = '#ffffff'
}) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={meshRef} scale={[scale, scale, scale]}>
      {children}
    </group>
  );
};

export default Icon3DBase;
