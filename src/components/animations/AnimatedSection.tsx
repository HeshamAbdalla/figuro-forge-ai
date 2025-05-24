
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

const getInitialPosition = (direction: string) => {
  switch (direction) {
    case "up": return { y: 20, opacity: 0 };
    case "down": return { y: -20, opacity: 0 };
    case "left": return { x: 20, opacity: 0 };
    case "right": return { x: -20, opacity: 0 };
    default: return { y: 20, opacity: 0 };
  }
};

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5
}) => {
  const location = useLocation();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Reset animation state when route changes
    setHasNavigated(false);
    
    // Small delay to allow page transition to start
    const timer = setTimeout(() => {
      setHasNavigated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Reduce delay and animation intensity for better performance
  const adjustedDelay = hasNavigated ? delay + 0.1 : delay;

  return (
    <motion.div
      initial={getInitialPosition(direction)}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-30px" }}
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
