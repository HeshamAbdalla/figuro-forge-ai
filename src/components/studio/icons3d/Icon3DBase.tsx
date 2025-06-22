
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

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
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {children}
    </group>
  );
};

export default Icon3DBase;
