
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
          Experience 3D Magic
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto px-4">
          Watch our AI-generated 3D models come to life with interactive animations and stunning visual effects
        </p>
      </motion.div>

      {/* 3D Canvas */}
      <div className="relative h-[70vh] w-full">
        <Canvas
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
          
          {/* Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#9b87f5" />
          
          {/* Environment */}
          <Environment preset="city" />
          
          {/* Main Scene */}
          <Suspense fallback={null}>
            <FloatingModelsScene />
          </Suspense>
          
          {/* Controls */}
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
            Loading 3D Experience...
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
