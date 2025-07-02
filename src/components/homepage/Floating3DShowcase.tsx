
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import FloatingModelsScene from './FloatingModelsScene';
import ShowcaseControls from './ShowcaseControls';

const Floating3DShowcase: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-figuro-dark via-gray-900 to-figuro-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-figuro-accent/10 via-transparent to-transparent" />
      
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-20 pb-10 text-center"
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
          Community 3D Showcase
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto px-4">
          Explore real 3D models created by our community. Interactive animations showcase the creativity and quality possible with our AI platform.
        </p>
      </motion.div>

      {/* 3D Canvas with optimized settings */}
      <div className="relative h-[70vh] w-full">
        <Canvas
          dpr={[0.5, 1.5]} // Reduced DPR for better performance
          performance={{ min: 0.1, max: 0.8 }} // More aggressive performance scaling
          className="w-full h-full"
          gl={{
            powerPreference: "low-power",
            antialias: false,
            alpha: true,
            preserveDrawingBuffer: false
          }}
          frameloop="demand" // Only render when needed
        >
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
          
          {/* Simplified lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 2]}
            intensity={0.6}
            castShadow={false} // Disable shadows for better performance
          />
          <pointLight position={[-5, -5, -2]} intensity={0.3} color="#9b87f5" />
          
          {/* Environment with lower resolution */}
          <Environment preset="city" resolution={256} />
          
          {/* Main Scene */}
          <Suspense fallback={null}>
            <FloatingModelsScene />
          </Suspense>
          
          {/* Controls with reduced auto-rotation */}
          <ShowcaseControls />
        </Canvas>
        
        {/* Loading Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-white/50 text-lg"
          >
            Loading Community Models...
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 text-center py-16"
      >
        <h3 className="text-2xl font-semibold text-white mb-4">
          Ready to Create Your Own?
        </h3>
        <p className="text-white/60 mb-6 max-w-lg mx-auto">
          Join our community and start creating stunning 3D models with AI. Your creations could be featured in our showcase!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-8 py-3 rounded-xl font-semibold shadow-glow-sm hover:shadow-glow transition-all duration-300"
          onClick={() => window.location.href = '/studio'}
        >
          Start Creating
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Floating3DShowcase;
