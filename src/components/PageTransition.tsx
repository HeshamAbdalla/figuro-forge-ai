
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState, useRef } from "react";

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
  duration: 0.15
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  const location = useLocation();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const previousLocation = useRef<string>("");

  useEffect(() => {
    // Check if this is actually a route change or just initial load
    if (previousLocation.current !== "" && previousLocation.current !== location.pathname) {
      // This is a route change, not initial load
      setIsFirstRender(false);
    } else if (previousLocation.current === "") {
      // This is the very first render
      const timer = setTimeout(() => {
        setIsFirstRender(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
    
    previousLocation.current = location.pathname;
  }, [location.pathname]);

  // On first render, don't animate to avoid conflict with component animations
  if (isFirstRender) {
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
