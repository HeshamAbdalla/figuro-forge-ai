
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      enableRotate={true}
      rotateSpeed={0.05} // Very subtle rotation for background effect
      autoRotate={true}
      autoRotateSpeed={0.1} // Gentle auto-rotation
      dampingFactor={0.03}
      enableDamping={true}
      minPolarAngle={Math.PI / 3} // Limit vertical rotation
      maxPolarAngle={Math.PI - Math.PI / 3}
      makeDefault={false} // Don't interfere with user interactions
    />
  );
};

export default ShowcaseControls;
