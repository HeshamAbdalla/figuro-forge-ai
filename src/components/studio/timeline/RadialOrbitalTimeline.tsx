import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { OrbitalNode } from './OrbitalNode';
import { TimelineNode } from '../types';

interface RadialOrbitalTimelineProps {
  nodes: TimelineNode[];
  onNodeClick: (node: TimelineNode) => void;
  className?: string;
}

export const RadialOrbitalTimeline: React.FC<RadialOrbitalTimelineProps> = ({
  nodes,
  onNodeClick,
  className = ""
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]));
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]));

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleNodeClick = (node: TimelineNode) => {
    setSelectedNode(node.id);
    onNodeClick(node);
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
  };

  // Calculate orbital positions for nodes
  const calculateOrbitalPositions = () => {
    const positions: Array<[number, number, number]> = [];
    const radius = 4;
    const layers = Math.ceil(nodes.length / 6);
    
    nodes.forEach((_, index) => {
      const layer = Math.floor(index / 6);
      const angleStep = (Math.PI * 2) / Math.min(6, nodes.length - layer * 6);
      const angle = (index % 6) * angleStep;
      const layerRadius = radius + layer * 2;
      
      const x = Math.cos(angle) * layerRadius;
      const z = Math.sin(angle) * layerRadius;
      const y = Math.sin(index * 0.5) * 0.5; // Slight vertical variation
      
      positions.push([x, y, z]);
    });
    
    return positions;
  };

  const orbitalPositions = calculateOrbitalPositions();

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[600px] bg-gradient-to-br from-figuro-dark via-purple-900/20 to-figuro-dark ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* 3D Canvas */}
      <motion.div
        className="absolute inset-0"
        style={{
          rotateX,
          rotateY,
          perspective: 1200,
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 12], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={8}
            maxDistance={20}
            autoRotate={!hoveredNode}
            autoRotateSpeed={0.5}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* Central Hub */}
          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#4c1d95"
                emissiveIntensity={0.5}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
          </group>
          
          {/* Orbital Nodes */}
          {nodes.map((node, index) => (
            <OrbitalNode
              key={node.id}
              node={node}
              position={orbitalPositions[index]}
              isSelected={selectedNode === node.id}
              isHovered={hoveredNode === node.id}
              onClick={() => handleNodeClick(node)}
              onHover={(isHovered) => handleNodeHover(isHovered ? node.id : null)}
            />
          ))}
          
          {/* Orbital Rings */}
          {Array.from({ length: Math.ceil(nodes.length / 6) }).map((_, layer) => (
            <mesh key={layer} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <ringGeometry args={[4 + layer * 2 - 0.05, 4 + layer * 2 + 0.05, 64]} />
              <meshBasicMaterial
                color="#8b5cf6"
                transparent
                opacity={0.1}
                side={2}
              />
            </mesh>
          ))}
        </Canvas>
      </motion.div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-8 z-10"
        >
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text">
            Creative Studio
          </h1>
          <p className="text-white/60 mt-2">Choose your creative journey</p>
        </motion.div>

        {/* Node Info Panel */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 pointer-events-auto max-w-sm"
          >
            {(() => {
              const node = nodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              
              return (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">{node.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{node.description}</p>
                  <div className="flex items-center gap-2">
                    {node.popular && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                        🔥 Popular
                      </span>
                    )}
                    {node.new && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                        ✨ New
                      </span>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Navigation Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute top-8 right-8 text-white/60 text-sm pointer-events-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <p className="mb-2">🖱️ Drag to rotate</p>
            <p className="mb-2">🔍 Scroll to zoom</p>
            <p>👆 Click nodes to navigate</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};