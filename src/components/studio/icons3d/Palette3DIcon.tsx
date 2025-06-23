import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Icon3DBase from './Icon3DBase';

const Palette3DIcon: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      
      <Icon3DBase autoRotate={false}>
        <group>
          {/* Palette base */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
            <cylinderGeometry args={[1.2, 1.2, 0.1, 8]} />
            <meshStandardMaterial color="#f7fafc" />
          </mesh>
          
          {/* Color blobs */}
          <mesh position={[0.6, 0.3, 0.1]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          
          <mesh position={[-0.4, 0.5, 0.1]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          
          <mesh position={[0.2, -0.6, 0.1]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          
          <mesh position={[-0.7, -0.2, 0.1]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          
          <mesh position={[0.8, -0.4, 0.1]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
          
          {/* Paintbrush */}
          <group position={[-0.5, -0.8, 0.3]} rotation={[0, 0, Math.PI / 4]}>
            {/* Handle */}
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            
            {/* Ferrule */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.08, 0.05, 0.2, 8]} />
              <meshStandardMaterial color="#c0c0c0" />
            </mesh>
            
            {/* Bristles */}
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.06, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#2d3748" />
            </mesh>
          </group>
        </group>
      </Icon3DBase>
      
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="apartment" />
    </Canvas>
  );
};

export default Palette3DIcon;
