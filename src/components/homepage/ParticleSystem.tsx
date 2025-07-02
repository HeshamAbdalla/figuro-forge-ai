
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  
  // Optimized particle count for better visibility without performance loss
  const particleCount = 600;
  
  // Generate enhanced particle positions with better distribution
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Better spread with enhanced visibility
      pos[i3] = (Math.random() - 0.5) * 25;     // x
      pos[i3 + 1] = (Math.random() - 0.5) * 25; // y
      pos[i3 + 2] = (Math.random() - 0.2) * 20; // z - better depth distribution
    }
    
    return pos;
  }, [particleCount]);

  // Enhanced animation with better visibility
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update particles with enhanced movement
    if (Math.floor(time * 60) % 3 === 0) { // Slightly less frequent updates for smoother performance
      const positions = pointsRef.current.geometry.attributes.position;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Enhanced depth-based floating motion
        const depth = positions.array[i3 + 2];
        const depthFactor = (depth + 15) / 35; // Better depth normalization
        
        positions.array[i3 + 1] += Math.sin(time * 1.2 + i * 0.03) * 0.002 * depthFactor;
        positions.array[i3] += Math.cos(time * 0.8 + i * 0.02) * 0.001 * depthFactor;
        
        // Enhanced wrapping
        if (positions.array[i3 + 1] > 12) {
          positions.array[i3 + 1] = -12;
        }
        if (positions.array[i3] > 12) {
          positions.array[i3] = -12;
        }
      }
      
      positions.needsUpdate = true;
    }
    
    // Enhanced rotation for better visibility
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.02;
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
        size={0.03} // Slightly larger for better visibility
        color="#9b87f5"
        transparent
        opacity={0.7} // Increased opacity for better visibility
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;
