import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import Icon3DBase from './Icon3DBase';

const Text3DIcon: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      
      <Icon3DBase autoRotate={false}>
        <group>
          {/* 3D Text */}
          <Text
            fontSize={0.8}
            position={[0, 0.2, 0]}
          >
            AI
            <meshStandardMaterial 
              color="#9333ea"
              metalness={0.5}
              roughness={0.2}
            />
          </Text>
          
          {/* Floating letters */}
          <Text
            fontSize={0.3}
            position={[-1, -0.5, 0.5]}
            rotation={[0, 0, Math.PI / 6]}
          >
            A
            <meshStandardMaterial color="#ec4899" />
          </Text>
          
          <Text
            fontSize={0.25}
            position={[0.8, -0.3, -0.3]}
            rotation={[0, 0, -Math.PI / 8]}
          >
            B
            <meshStandardMaterial color="#06b6d4" />
          </Text>
          
          <Text
            fontSize={0.2}
            position={[0, -0.8, 0.2]}
            rotation={[0, 0, Math.PI / 4]}
          >
            C
            <meshStandardMaterial color="#10b981" />
          </Text>
        </group>
      </Icon3DBase>
      
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="city" />
    </Canvas>
  );
};

export default Text3DIcon;
