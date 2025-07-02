
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false} // Disable zoom to maintain foreground effect
      enableRotate={true}
      rotateSpeed={0.1} // Very gentle rotation
      minDistance={8}
      maxDistance={15}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI - Math.PI / 4}
      autoRotate={true}
      autoRotateSpeed={0.3} // Slightly faster auto-rotation for dynamic effect
      dampingFactor={0.05} // Smooth damping
      enableDamping={true}
    />
  );
};

export default ShowcaseControls;
