
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useModelLoader } from '@/hooks/useModelLoader';
import { ErrorBoundary } from './ErrorBoundary';

interface ModelContentProps {
  modelUrl: string;
  onError: (error: string) => void;
}

const ModelContent: React.FC<ModelContentProps> = ({ modelUrl, onError }) => {
  const { loading, model, error, loadModel } = useModelLoader();
  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (modelUrl && !hasStartedLoading.current) {
      hasStartedLoading.current = true;
      loadModel(modelUrl);
    }
  }, [modelUrl, loadModel]);

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
    );
  }

  if (error || !model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
    );
  }

  return (
    <Center scale={1.5}>
      <primitive object={model} />
    </Center>
  );
};

interface ModelPreviewProps {
  modelUrl: string;
  className?: string;
  onError?: (error: string) => void;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ 
  modelUrl, 
  className = "w-full h-[400px]",
  onError = () => {}
}) => {
  const handleError = (error: string) => {
    console.error('ModelPreview error:', error);
    onError(error);
  };

  if (!modelUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <p className="text-gray-500">No model available</p>
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ErrorBoundary 
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
            <p className="text-red-600">Failed to load 3D model</p>
          </div>
        }
        onError={handleError}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ background: '#1a1a1a' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 2, 2]} intensity={0.8} />
          
          <Suspense fallback={null}>
            <ModelContent modelUrl={modelUrl} onError={handleError} />
          </Suspense>
          
          <OrbitControls 
            enablePan={false}
            maxDistance={10}
            minDistance={2}
          />
          
          <Environment preset="studio" />
        </Canvas>
      </ErrorBoundary>
    </motion.div>
  );
};

export default ModelPreview;
