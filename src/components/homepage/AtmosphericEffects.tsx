
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Fog, Color } from 'three';
import { useThree } from '@react-three/fiber';

const AtmosphericEffects: React.FC = () => {
  const { scene } = useThree();
  const fogRef = useRef<Fog>();

  // Enhanced fog setup for better visibility
  React.useEffect(() => {
    const fog = new Fog(new Color('#09090f'), 12, 30); // Reduced near fog for better visibility
    scene.fog = fog;
    fogRef.current = fog;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Enhanced fog animation with better visibility
  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.elapsedTime;
      const fogIntensity = 12 + Math.sin(time * 0.3) * 3; // Increased base visibility
      fogRef.current.near = fogIntensity;
      fogRef.current.far = fogIntensity + 18;
    }
  });

  return (
    <>
      {/* Enhanced atmospheric lighting for better visibility */}
      <pointLight
        position={[0, 8, 5]}
        intensity={0.6} // Increased intensity
        color="#9b87f5"
        distance={20} // Increased distance
        decay={1.5} // Reduced decay for better reach
      />
      
      {/* Enhanced rim lighting for depth and visibility */}
      <directionalLight
        position={[-8, 3, -8]}
        intensity={0.7} // Increased intensity
        color="#3b82f6"
      />
      
      <directionalLight
        position={[8, -3, 8]}
        intensity={0.5} // Increased intensity
        color="#f59e0b"
      />
      
      {/* Additional ambient lighting for overall visibility */}
      <ambientLight intensity={0.4} color="#4c1d95" />
      
      {/* Enhanced background gradient sphere with reduced opacity */}
      <mesh scale={80}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#09090f"
          side={1} // BackSide
          transparent
          opacity={0.7} // Reduced opacity for better 3D visibility
        />
      </mesh>
    </>
  );
};

export default AtmosphericEffects;
