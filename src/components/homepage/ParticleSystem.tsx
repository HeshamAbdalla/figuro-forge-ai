
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointsMaterial, BufferGeometry, BufferAttribute } from 'three';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  
  // Generate particle positions
  const particleCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;     // x
      pos[i3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    
    return pos;
  }, []);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Gentle floating motion
      positions.array[i3 + 1] += Math.sin(time + i * 0.01) * 0.001;
      
      // Wrap particles that float too high
      if (positions.array[i3 + 1] > 10) {
        positions.array[i3 + 1] = -10;
      }
    }
    
    positions.needsUpdate = true;
    
    // Rotate entire particle system slowly
    pointsRef.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#9b87f5"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
