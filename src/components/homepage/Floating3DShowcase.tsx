
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <div className="w-full h-full">
      {/* 3D Canvas that fills its container */}
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.5, max: 0.8 }}
        className="w-full h-full"
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false
        }}
        frameloop="always"
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 10]} 
          fov={50}
          near={0.1}
          far={100}
        />
        
        {/* Ambient lighting for the scene */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#9b87f5" />
        
        {/* Environment for enhanced depth */}
        <Environment preset="city" resolution={512} />
        
        {/* Main Scene */}
        <Suspense fallback={null}>
          <FloatingModelsScene />
        </Suspense>
        
        {/* Controls for the 3D scene */}
        <ShowcaseControls />
      </Canvas>
    </div>
  );
};

export default Floating3DShowcase;
