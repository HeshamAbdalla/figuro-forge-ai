
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

const getInitialPosition = (direction: string) => {
  switch (direction) {
    case "up": return { y: 30, opacity: 0 };
    case "down": return { y: -30, opacity: 0 };
    case "left": return { x: 30, opacity: 0 };
    case "right": return { x: -30, opacity: 0 };
    default: return { y: 30, opacity: 0 };
  }
};

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Detect if this is initial page load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Add extra delay on initial load to avoid conflicts
  const adjustedDelay = isInitialLoad ? delay + 0.3 : delay;

  return (
    <motion.div
      initial={getInitialPosition(direction)}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay: adjustedDelay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
