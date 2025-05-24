
import { motion } from "framer-motion";
import { ReactNode } from "react";

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
  return (
    <motion.div
      initial={getInitialPosition(direction)}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
