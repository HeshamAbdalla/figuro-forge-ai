
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.3} // Reduced for smoother interaction
      rotateSpeed={0.2} // Reduced for smoother interaction
      minDistance={4}
      maxDistance={12}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      autoRotate={true}
      autoRotateSpeed={0.2} // Reduced auto-rotation speed
      dampingFactor={0.1} // Add damping for smoother controls
      enableDamping={true}
    />
  );
};

export default ShowcaseControls;
