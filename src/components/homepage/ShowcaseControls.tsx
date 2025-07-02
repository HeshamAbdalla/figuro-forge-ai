
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.5}
      rotateSpeed={0.3}
      minDistance={4}
      maxDistance={12}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      autoRotate={true}
      autoRotateSpeed={0.5}
    />
  );
};

export default ShowcaseControls;
