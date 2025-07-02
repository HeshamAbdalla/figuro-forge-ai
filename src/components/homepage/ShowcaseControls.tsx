
import React from 'react';
import { OrbitControls } from '@react-three/drei';

const ShowcaseControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true} // Enable zoom for interactivity
      enableRotate={true}
      rotateSpeed={0.2} // Slightly more responsive
      zoomSpeed={0.6}
      minDistance={5} // Allow closer viewing
      maxDistance={20} // Allow further viewing
      minPolarAngle={Math.PI / 6} // More flexible viewing angles
      maxPolarAngle={Math.PI - Math.PI / 6}
      autoRotate={true}
      autoRotateSpeed={0.5} // Slightly faster for more dynamic effect
      dampingFactor={0.08} // Smoother damping
      enableDamping={true}
    />
  );
};

export default ShowcaseControls;
