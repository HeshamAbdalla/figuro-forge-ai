
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 50 }}>
      {/* 3D Canvas optimized for foreground showcase */}
      <Canvas
        dpr={[0.8, 2]} // Higher quality for foreground effect
        performance={{ min: 0.2, max: 1 }} 
        className="w-full h-full"
        gl={{
          powerPreference: "high-performance", // Better performance for foreground
          antialias: true, // Enable antialiasing for better quality
          alpha: true,
          preserveDrawingBuffer: false
        }}
        frameloop="always" // Always render for smooth foreground animations
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 12]} 
          fov={50} // Adjusted FOV for better "popping out" effect
          near={0.1}
          far={100}
        />
        
        {/* Enhanced lighting for foreground showcase */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[8, 8, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-8, -8, -5]} intensity={0.4} color="#9b87f5" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
          castShadow
        />
        
        {/* Environment with higher resolution for quality */}
        <Environment preset="city" resolution={512} />
        
        {/* Main Scene */}
        <Suspense fallback={null}>
          <FloatingModelsScene />
        </Suspense>
        
        {/* Interactive controls with enhanced settings */}
        <ShowcaseControls />
      </Canvas>
    </div>
  );
};

export default Floating3DShowcase;
