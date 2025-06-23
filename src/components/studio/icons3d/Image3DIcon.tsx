import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Icon3DBase from './Icon3DBase';

const Image3DIcon: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      
      <Icon3DBase autoRotate={false}>
        <group>
          {/* Photo frame */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[1.8, 1.4, 0.1]} />
            <meshStandardMaterial color="#4a90e2" />
          </mesh>
          
          {/* Photo */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.5, 1.1]} />
            <meshStandardMaterial color="#87ceeb" />
          </mesh>
          
          {/* Mountain silhouette */}
          <mesh position={[-0.3, -0.2, 0.01]}>
            <coneGeometry args={[0.3, 0.4, 3]} />
            <meshStandardMaterial color="#228b22" />
          </mesh>
          
          <mesh position={[0.2, -0.1, 0.01]}>
            <coneGeometry args={[0.25, 0.3, 3]} />
            <meshStandardMaterial color="#32cd32" />
          </mesh>
          
          {/* Sun */}
          <mesh position={[0.5, 0.3, 0.01]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
        </group>
      </Icon3DBase>
      
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="sunset" />
    </Canvas>
  );
};

export default Image3DIcon;
