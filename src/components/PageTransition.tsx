
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // After the first render, mark as not initial load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // On initial load, don't animate to avoid conflict with component animations
  if (isInitialLoad) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
