import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import { TimelineNode } from '../types';
import * as THREE from 'three';

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
  const textRef = useRef<THREE.Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  const { camera, raycaster, mouse, scene } = useThree();

  // Animation
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    
    // Rotation animation
    meshRef.current.rotation.y += 0.01;
    
    // Scale based on interaction
    const targetScale = isHovered || isSelected ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Text always face camera
    if (textRef.current) {
      textRef.current.lookAt(camera.position);
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

  return (
    <group position={position}>
      {/* Main Node Sphere */}
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

      {/* Connection Line to Center */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                0, 0, 0,  // Start at node
                -position[0] * 0.9, -position[1] * 0.9, -position[2] * 0.9  // End near center
              ])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={nodeColor}
            transparent
            opacity={isHovered || isSelected ? 0.6 : 0.2}
            linewidth={2}
          />
        </line>
      </group>

      {/* Particle Effects for Special Nodes */}
      {(node.popular || node.new) && (
        <group>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 6) * Math.PI * 2) * 1.2,
                Math.sin(Date.now() * 0.001 + i) * 0.1,
                Math.sin((i / 6) * Math.PI * 2) * 1.2,
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial
                color={node.popular ? '#fbbf24' : '#10b981'}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};