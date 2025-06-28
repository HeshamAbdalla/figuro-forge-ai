
import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useResponsiveLayout = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};
