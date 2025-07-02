
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {/* Enhanced 3D Canvas with better visibility settings */}
      <Canvas
        dpr={[1, 1.8]} // Slightly increased quality for better visibility
        performance={{ min: 0.4, max: 0.9 }} // Improved performance range
        className="w-full h-full"
        gl={{
          powerPreference: "high-performance", // Better performance for visibility
          antialias: true, // Enable antialiasing for cleaner visuals
          alpha: true,
          preserveDrawingBuffer: false
        }}
        frameloop="always" // Always render for smooth animations
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 12]} 
          fov={55} // Slightly wider FOV for better showcase
          near={0.1}
          far={100}
        />
        
        {/* Enhanced lighting for better visibility */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2} // Increased intensity
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#9b87f5" />
        
        {/* Environment for enhanced depth with better visibility */}
        <Environment preset="city" resolution={1024} />
        
        {/* Main Scene */}
        <Suspense fallback={null}>
          <FloatingModelsScene />
        </Suspense>
        
        {/* Enhanced controls */}
        <ShowcaseControls />
      </Canvas>
    </div>
  );
};

export default Floating3DShowcase;
