
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 100 }}>
      {/* 3D Canvas optimized for dramatic foreground showcase */}
      <Canvas
        dpr={[1, 2]} // Higher quality for foreground effect
        performance={{ min: 0.5, max: 1 }} 
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
          position={[0, 0, 8]} 
          fov={65} // Wider FOV for more dramatic "popping out" effect
          near={0.1}
          far={100}
        />
        
        {/* Enhanced lighting for dramatic showcase */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.6} color="#9b87f5" />
        <spotLight
          position={[0, 15, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          color="#ffffff"
          castShadow
        />
        
        {/* High-resolution environment for quality */}
        <Environment preset="city" resolution={1024} />
        
        {/* Main Scene */}
        <Suspense fallback={null}>
          <FloatingModelsScene />
        </Suspense>
        
        {/* Interactive controls optimized for showcase */}
        <ShowcaseControls />
      </Canvas>
    </div>
  );
};

export default Floating3DShowcase;
