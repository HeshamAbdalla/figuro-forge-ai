
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Icon3DBase from './Icon3DBase';

const Gallery3DIcon: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      
      <Icon3DBase rotationSpeed={0.4}>
        <group>
          {/* Main image frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 1.2, 0.1]} />
            <meshStandardMaterial color="#4c1d95" />
          </mesh>
          
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.3, 1]} />
            <meshStandardMaterial color="#ddd6fe" />
          </mesh>
          
          {/* Smaller frame 1 */}
          <mesh position={[-0.8, 0.5, 0.3]} rotation={[0, 0, Math.PI / 12]}>
            <boxGeometry args={[0.8, 0.6, 0.08]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>
          
          <mesh position={[-0.8, 0.5, 0.35]} rotation={[0, 0, Math.PI / 12]}>
            <planeGeometry args={[0.65, 0.45]} />
            <meshStandardMaterial color="#c4b5fd" />
          </mesh>
          
          {/* Smaller frame 2 */}
          <mesh position={[0.8, -0.6, 0.2]} rotation={[0, 0, -Math.PI / 8]}>
            <boxGeometry args={[0.9, 0.7, 0.08]} />
            <meshStandardMaterial color="#5b21b6" />
          </mesh>
          
          <mesh position={[0.8, -0.6, 0.25]} rotation={[0, 0, -Math.PI / 8]}>
            <planeGeometry args={[0.75, 0.55]} />
            <meshStandardMaterial color="#ede9fe" />
          </mesh>
          
          {/* 3D elements on images */}
          <mesh position={[0, 0, 0.12]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          
          <mesh position={[-0.8, 0.5, 0.4]} rotation={[0, 0, Math.PI / 12]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          
          <mesh position={[0.8, -0.6, 0.3]} rotation={[0, 0, -Math.PI / 8]}>
            <coneGeometry args={[0.08, 0.15, 4]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        </group>
      </Icon3DBase>
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      <Environment preset="forest" />
    </Canvas>
  );
};

export default Gallery3DIcon;
