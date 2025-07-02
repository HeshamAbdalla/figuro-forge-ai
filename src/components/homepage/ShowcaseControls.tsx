
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false} // Disable zoom for background
      enableRotate={true}
      rotateSpeed={0.1} // Slower rotation for background
      autoRotate={true}
      autoRotateSpeed={0.2} // Slower auto-rotation
      dampingFactor={0.05} // Smoother damping
      enableDamping={true}
      minPolarAngle={Math.PI / 4} // Limit vertical rotation
      maxPolarAngle={Math.PI - Math.PI / 4}
    />
  );
};

export default ShowcaseControls;
