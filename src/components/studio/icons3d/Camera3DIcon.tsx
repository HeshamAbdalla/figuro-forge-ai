
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Icon3DBase from './Icon3DBase';

const Camera3DIcon: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      
      <Icon3DBase rotationSpeed={0.6}>
        <group>
          {/* Camera body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 1, 0.8]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
          
          {/* Camera lens */}
          <mesh position={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a202c" />
          </mesh>
          
          {/* Lens glass */}
          <mesh position={[0, 0, 0.65]}>
            <cylinderGeometry args={[0.35, 0.35, 0.02, 16]} />
            <meshStandardMaterial 
              color="#4fd1c7" 
              transparent 
              opacity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          
          {/* Flash */}
          <mesh position={[-0.5, 0.3, 0.3]}>
            <boxGeometry args={[0.2, 0.15, 0.1]} />
            <meshStandardMaterial color="#f7fafc" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
          
          {/* Viewfinder */}
          <mesh position={[0, 0.4, -0.2]}>
            <boxGeometry args={[0.6, 0.2, 0.3]} />
            <meshStandardMaterial color="#4a5568" />
          </mesh>
        </group>
      </Icon3DBase>
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      <Environment preset="studio" />
    </Canvas>
  );
};

export default Camera3DIcon;
