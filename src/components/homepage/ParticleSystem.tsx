
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  
  // Reduced particle count for better performance
  const particleCount = 500;
  
  // Generate particle positions only once
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 15;     // x - reduced range
      pos[i3 + 1] = (Math.random() - 0.5) * 15; // y - reduced range
      pos[i3 + 2] = (Math.random() - 0.5) * 15; // z - reduced range
    }
    
    return pos;
  }, [particleCount]);

  // Optimize animation with reduced frequency updates
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update only every 3rd frame for better performance
    if (Math.floor(time * 60) % 3 === 0) {
      const positions = pointsRef.current.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Gentle floating motion with reduced calculation
        positions.array[i3 + 1] += Math.sin(time * 0.5 + i * 0.01) * 0.0005;
        
        // Wrap particles that float too high
        if (positions.array[i3 + 1] > 7.5) {
          positions.array[i3 + 1] = -7.5;
        }
      }
      
      positions.needsUpdate = true;
    }
    
    // Rotate entire particle system slowly
    pointsRef.current.rotation.y = time * 0.01;
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
        size={0.015}
        color="#9b87f5"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
