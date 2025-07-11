import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TimelineNode } from '../types';
import * as THREE from 'three';
import { useTimelineModelLoader } from '../../model-viewer/hooks/useTimelineModelLoader';

interface OrbitalNodeProps {
  node: TimelineNode;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}

export const OrbitalNode: React.FC<OrbitalNodeProps> = ({
  node,
  position,
  isSelected,
  isHovered,
  onClick,
  onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [localHovered, setLocalHovered] = useState(false);

  // Validate position prop
  const safePosition = useMemo(() => {
    if (!position || !Array.isArray(position) || position.length !== 3) {
      console.warn('Invalid position provided to OrbitalNode:', position);
      return [0, 0, 0] as [number, number, number];
    }
    return position.map(p => typeof p === 'number' && !isNaN(p) ? p : 0) as [number, number, number];
  }, [position]);

  // Simplified animation with better error handling
  useFrame((state) => {
    if (!state?.clock) return;
    
    try {
      const elapsedTime = state.clock.elapsedTime || 0;
      
      // Apply animation to the active element (mesh for sphere, group for 3D model)
      const activeElement = node.modelUrl ? groupRef.current : meshRef.current;
      
      if (!activeElement || !activeElement.position || !activeElement.rotation) return;
      
      // Gentle floating animation
      activeElement.position.y = safePosition[1] + Math.sin(elapsedTime + safePosition[0]) * 0.1;
      
      // Rotation animation
      activeElement.rotation.y += 0.01;
      
      // Scale animation for mesh (3D models handle scale via props)
      if (!node.modelUrl && activeElement.scale && typeof activeElement.scale.lerp === 'function') {
        const targetScale = isHovered || isSelected ? 1.2 : 1;
        const targetVector = new THREE.Vector3(targetScale, targetScale, targetScale);
        activeElement.scale.lerp(targetVector, 0.1);
      }
    } catch (error) {
      console.error('Error in OrbitalNode animation:', error);
    }
  });

  const handlePointerOver = () => {
    setLocalHovered(true);
    onHover(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick();
  };

  // Color based on node type
  const getNodeColor = () => {
    switch (node.type) {
      case 'image-to-3d':
        return '#3b82f6'; // Blue
      case 'text-to-3d':
        return '#8b5cf6'; // Purple
      case 'camera':
        return '#10b981'; // Green
      case 'web-icons':
        return '#f59e0b'; // Orange
      case 'gallery':
        return '#6366f1'; // Indigo
      default:
        return '#8b5cf6';
    }
  };

  const nodeColor = getNodeColor();
  const emissiveIntensity = isHovered || isSelected ? 0.8 : 0.3;

  // Early return with validation
  if (!safePosition || safePosition.some(isNaN)) {
    console.warn('OrbitalNode: Invalid position, skipping render');
    return null;
  }

  // Use optimized timeline model loader
  const { loading: modelLoading, model: loadedModel, error: modelError } = useTimelineModelLoader({
    modelUrl: node.modelUrl,
    modelId: `timeline-${node.id}`,
    priority: isSelected ? 10 : (isHovered ? 5 : 0)
  });

  return (
    <group position={safePosition}>
      {/* Render 3D Model if available, otherwise fallback to sphere */}
      {node.modelUrl ? (
        <group
          ref={groupRef}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          scale={isHovered || isSelected ? 1.2 : 1}
        >
          {loadedModel && !modelLoading ? (
            <primitive 
              object={loadedModel.clone()} 
              scale={[0.8, 0.8, 0.8]}
              position={[0, 0, 0]}
            />
          ) : (
            <mesh castShadow receiveShadow>
              <icosahedronGeometry args={[0.3, 1]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={modelLoading ? 0.8 : 0.5}
                wireframe={modelLoading}
                transparent
                opacity={modelLoading ? 0.7 : 1}
              />
            </mesh>
          )}
        </group>
      ) : (
        <>
          {/* Fallback Sphere */}
          <mesh
            ref={meshRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            castShadow
            receiveShadow
          >
            <icosahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={emissiveIntensity}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Glow Effect */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial
              color={nodeColor}
              transparent
              opacity={isHovered || isSelected ? 0.2 : 0.1}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* Node Icon */}
      <Html
        transform
        distanceFactor={6}
        position={[0, 0, 0.6]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 text-white">
          <span className="text-lg">{node.icon}</span>
        </div>
      </Html>

      {/* Node Label */}
      <Html
        transform
        distanceFactor={8}
        position={[0, -1, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="text-center">
          <div className="text-white text-sm font-semibold whitespace-nowrap bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
            {node.title}
          </div>
        </div>
      </Html>

      {/* Simplified Connection Line - Temporarily removed complex buffer geometry */}
      {/* TODO: Re-implement connection line with proper geometry once error is resolved */}
    </group>
  );
};