
import { useState, useEffect } from 'react';

interface MobileBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isSmallMobile: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useResponsiveMobile = (): MobileBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<MobileBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    isSmallMobile: false,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isSmallMobile = width < 480;
      const orientation = width < height ? 'portrait' : 'landscape';
      
      setBreakpoints({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        isSmallMobile,
        orientation,
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};
