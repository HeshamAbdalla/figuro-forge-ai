
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {/* 3D Canvas positioned as background */}
      <Canvas
        dpr={[1, 1.5]} // Reduced quality for background
        performance={{ min: 0.3, max: 0.8 }} 
        className="w-full h-full"
        gl={{
          powerPreference: "default",
          antialias: false,
          alpha: true,
          preserveDrawingBuffer: false
        }}
        frameloop="demand"
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 12]} 
          fov={50} // Narrower FOV for background effect
          near={0.1}
          far={100}
        />
        
        {/* Softer lighting for background */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#9b87f5" />
        
        {/* Environment for background depth */}
        <Environment preset="city" resolution={512} />
        
        {/* Main Scene */}
        <Suspense fallback={null}>
          <FloatingModelsScene />
        </Suspense>
        
        {/* Background controls */}
        <ShowcaseControls />
      </Canvas>
    </div>
  );
};

export default Floating3DShowcase;
