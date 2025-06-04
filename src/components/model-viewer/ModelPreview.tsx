
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useModelLoader } from '@/hooks/useModelLoader';
import { ErrorBoundary } from './ErrorBoundary';
import { prioritizeUrls } from '@/utils/urlValidationUtils';
import { logModelDebugInfo, testUrlAccessibility } from '@/utils/modelDebugUtils';

interface ModelContentProps {
  modelUrl: string;
  onError: (error: string) => void;
  fileName?: string;
}

const ModelContent: React.FC<ModelContentProps> = ({ modelUrl, onError, fileName }) => {
  const { loading, model, error, loadModel } = useModelLoader();
  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (modelUrl && !hasStartedLoading.current) {
      hasStartedLoading.current = true;
      
      // Debug the URL before loading
      console.log('🔄 [MODEL-PREVIEW] Starting model load debug for:', fileName);
      
      // Test URL accessibility first
      testUrlAccessibility(modelUrl).then(result => {
        console.log('🔍 [MODEL-PREVIEW] URL accessibility test:', result);
        if (!result.accessible && result.error) {
          console.warn('⚠️ [MODEL-PREVIEW] URL may not be accessible:', result.error);
        }
      });
      
      loadModel(modelUrl);
    }
  }, [modelUrl, loadModel, fileName]);

  useEffect(() => {
    if (error) {
      console.error('❌ [MODEL-PREVIEW] Error in ModelContent:', error);
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
    console.log('❌ [MODEL-PREVIEW] Rendering error state:', { error, hasModel: !!model });
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
    );
  }

  console.log('✅ [MODEL-PREVIEW] Rendering successful model for:', fileName);
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
  fileName?: string;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ 
  modelUrl, 
  className = "w-full h-[400px]",
  onError = () => {},
  fileName = 'Unknown'
}) => {
  const handleError = (error: string) => {
    console.error('❌ [MODEL-PREVIEW] ModelPreview error:', error);
    onError(error);
  };

  if (!modelUrl) {
    console.log('⚠️ [MODEL-PREVIEW] No model URL provided for:', fileName);
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <p className="text-gray-500">No model available</p>
      </div>
    );
  }

  // Log debug info for troubleshooting
  console.log('🔄 [MODEL-PREVIEW] Initializing ModelPreview for:', fileName, 'URL:', modelUrl);

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
            <div className="text-center">
              <p className="text-red-600 font-medium">Failed to load 3D model</p>
              <p className="text-red-500 text-sm mt-1">{fileName}</p>
            </div>
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
            <ModelContent 
              modelUrl={modelUrl} 
              onError={handleError}
              fileName={fileName}
            />
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
