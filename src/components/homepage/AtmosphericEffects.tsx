
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Fog, Color } from 'three';
import { useThree } from '@react-three/fiber';

const AtmosphericEffects: React.FC = () => {
  const { scene } = useThree();
  const fogRef = useRef<Fog>();

  // Set up fog
  React.useEffect(() => {
    const fog = new Fog(new Color('#09090f'), 5, 15);
    scene.fog = fog;
    fogRef.current = fog;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // Animate fog intensity
  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.elapsedTime;
      const fogIntensity = 5 + Math.sin(time * 0.5) * 2;
      fogRef.current.near = fogIntensity;
      fogRef.current.far = fogIntensity + 10;
    }
  });

  return (
    <>
      {/* Atmospheric lighting effects */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.2}
        color="#9b87f5"
        distance={10}
        decay={2}
      />
      
      {/* Rim lighting */}
      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.3}
        color="#3b82f6"
      />
      
      {/* Background gradient sphere */}
      <mesh scale={50}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#09090f"
          side={1} // BackSide
          transparent
          opacity={0.8}
        />
      </mesh>
    </>
  );
};

export default AtmosphericEffects;
