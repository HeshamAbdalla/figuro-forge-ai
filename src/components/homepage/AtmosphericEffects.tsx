
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Fog, Color } from 'three';
import { useThree } from '@react-three/fiber';

const AtmosphericEffects: React.FC = () => {
  const { scene } = useThree();
  const fogRef = useRef<Fog>();

  // Enhanced fog setup for foreground effect
  React.useEffect(() => {
    const fog = new Fog(new Color('#09090f'), 8, 25); // Adjusted for foreground
    scene.fog = fog;
    fogRef.current = fog;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Enhanced fog animation
  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.elapsedTime;
      const fogIntensity = 8 + Math.sin(time * 0.3) * 2;
      fogRef.current.near = fogIntensity;
      fogRef.current.far = fogIntensity + 17;
    }
  });

  return (
    <>
      {/* Enhanced atmospheric lighting for foreground showcase */}
      <pointLight
        position={[0, 8, 5]}
        intensity={0.3}
        color="#9b87f5"
        distance={15}
        decay={2}
      />
      
      {/* Multiple rim lighting for depth */}
      <directionalLight
        position={[-8, 3, -8]}
        intensity={0.4}
        color="#3b82f6"
      />
      
      <directionalLight
        position={[8, -3, 8]}
        intensity={0.3}
        color="#f59e0b"
      />
      
      {/* Enhanced background gradient sphere */}
      <mesh scale={80}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#09090f"
          side={1} // BackSide
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  );
};

export default AtmosphericEffects;
