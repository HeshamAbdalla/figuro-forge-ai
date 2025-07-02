
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  
  // Enhanced particle count for foreground effect
  const particleCount = 800;
  
  // Generate enhanced particle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Wider spread with bias towards foreground
      pos[i3] = (Math.random() - 0.5) * 20;     // x
      pos[i3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i3 + 2] = (Math.random() - 0.3) * 15; // z - biased towards camera
    }
    
    return pos;
  }, [particleCount]);

  // Enhanced animation with depth-based movement
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update particles with varying frequencies for depth effect
    if (Math.floor(time * 60) % 2 === 0) {
      const positions = pointsRef.current.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Depth-based floating motion
        const depth = positions.array[i3 + 2];
        const depthFactor = (depth + 10) / 25; // Normalize depth
        
        positions.array[i3 + 1] += Math.sin(time * 0.8 + i * 0.02) * 0.001 * depthFactor;
        positions.array[i3] += Math.cos(time * 0.5 + i * 0.01) * 0.0005 * depthFactor;
        
        // Wrap particles
        if (positions.array[i3 + 1] > 10) {
          positions.array[i3 + 1] = -10;
        }
        if (positions.array[i3] > 10) {
          positions.array[i3] = -10;
        }
      }
      
      positions.needsUpdate = true;
    }
    
    // Enhanced rotation
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.01;
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
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
