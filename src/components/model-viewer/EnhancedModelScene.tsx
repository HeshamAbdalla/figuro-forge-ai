
import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useModelLoader } from "./hooks/useModelLoader";
import { disposeModel } from "./utils/modelUtils";
import LoadingSpinner from "./LoadingSpinner";
import DummyBox from "./DummyBox";

interface EnhancedModelSceneProps {
  modelUrl: string | null;
  modelBlob?: Blob | null;
  autoRotate: boolean;
  showWireframe?: boolean;
  onModelError: (error: any) => void;
}

// Enhanced wireframe overlay component
const WireframeOverlay = ({ geometry }: { geometry: THREE.BufferGeometry }) => {
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  
  return (
    <lineSegments geometry={wireframeGeometry}>
      <lineBasicMaterial color="#00ff88" transparent opacity={0.3} />
    </lineSegments>
  );
};

// Enhanced model component with advanced features
const EnhancedModel = ({ 
  url, 
  blob, 
  showWireframe, 
  onError 
}: { 
  url: string | null; 
  blob: Blob | null; 
  showWireframe: boolean; 
  onError: (error: any) => void 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelGeometries, setModelGeometries] = useState<THREE.BufferGeometry[]>([]);
  const [hoveredMesh, setHoveredMesh] = useState<THREE.Mesh | null>(null);
  
  const { loading, model } = useModelLoader({
    modelSource: url,
    modelBlob: blob,
    modelId: `enhanced-${Date.now()}`,
    onError
  });

  // Extract geometries for wireframe overlay
  useEffect(() => {
    if (model) {
      const geometries: THREE.BufferGeometry[] = [];
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          geometries.push(child.geometry);
        }
      });
      setModelGeometries(geometries);
    }
  }, [model]);

  // Enhanced animation with breathing effect
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.set(breathingScale, breathingScale, breathingScale);
      
      // Enhanced hover effects
      if (hoveredMesh) {
        hoveredMesh.material.emissive.setHex(0x221122);
      }
    }
  });

  // Enhanced interaction handlers
  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHoveredMesh(event.object);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    if (hoveredMesh) {
      hoveredMesh.material.emissive.setHex(0x000000);
      setHoveredMesh(null);
    }
    document.body.style.cursor = 'auto';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!model) {
    return <DummyBox />;
  }

  return (
    <group ref={groupRef}>
      <Center scale={1.5}>
        <primitive 
          object={model}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
        
        {/* Wireframe overlay */}
        {showWireframe && modelGeometries.map((geometry, index) => (
          <WireframeOverlay key={index} geometry={geometry} />
        ))}
      </Center>
      
      {/* Interactive mesh info */}
      {hoveredMesh && (
        <Html position={[2, 2, 0]}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-2 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20"
          >
            <p className="text-white text-sm">
              Mesh: {hoveredMesh.name || 'Unnamed'}
            </p>
            <p className="text-white/70 text-xs">
              Vertices: {hoveredMesh.geometry.getAttribute('position')?.count || 0}
            </p>
          </motion.div>
        </Html>
      )}
    </group>
  );
};

const EnhancedModelScene: React.FC<EnhancedModelSceneProps> = ({
  modelUrl,
  modelBlob,
  autoRotate,
  showWireframe = false,
  onModelError
}) => {
  const sceneRef = useRef<THREE.Group>(null);

  // Scene-level animations
  useFrame((state) => {
    if (sceneRef.current && autoRotate) {
      sceneRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={sceneRef}>
      {(modelUrl || modelBlob) ? (
        <EnhancedModel
          url={modelUrl}
          blob={modelBlob}
          showWireframe={showWireframe}
          onError={onModelError}
        />
      ) : (
        <DummyBox />
      )}
    </group>
  );
};

export default EnhancedModelScene;
