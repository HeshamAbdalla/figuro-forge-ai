
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; initialDelay: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.initialDelay,
      staggerChildren: custom.staggerDelay,
      ease: "easeOut"
    }
  })
};

const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = "",
  staggerDelay = 0.1,
  initialDelay = 0.1
}) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Reset and prepare animation state when route changes
    setIsReady(false);
    
    // Shorter delay to prevent blocking content rendering
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Reduce initial delay to prevent content rendering issues
  const adjustedInitialDelay = isReady ? initialDelay : 0.05;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={{ staggerDelay, initialDelay: adjustedInitialDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
