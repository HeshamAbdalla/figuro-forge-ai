
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

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
  initialDelay = 0.2
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Detect if this is initial page load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Add extra delay on initial load to prevent conflicts with page transition
  const adjustedInitialDelay = isInitialLoad ? initialDelay + 0.4 : initialDelay;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      custom={{ staggerDelay, initialDelay: adjustedInitialDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
