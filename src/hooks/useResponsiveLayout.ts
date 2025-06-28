
import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  isSmallMobile: boolean;
  isLargeMobile: boolean;
}

export const useResponsiveLayout = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    isSmallMobile: false,
    isLargeMobile: false,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isSmallMobile = width < 480;
      const isLargeMobile = width >= 480 && width < 768;
      
      setBreakpoints({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        isSmallMobile,
        isLargeMobile,
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};

// Utility function for responsive spacing
export const getResponsiveSpacing = (mobile: string, tablet: string, desktop: string, currentBreakpoint: ResponsiveBreakpoints) => {
  if (currentBreakpoint.isMobile) return mobile;
  if (currentBreakpoint.isTablet) return tablet;
  return desktop;
};

// Utility function for responsive heights
export const getResponsiveHeight = (mobile: number, tablet: number, desktop: number, currentBreakpoint: ResponsiveBreakpoints) => {
  if (currentBreakpoint.isMobile) return mobile;
  if (currentBreakpoint.isTablet) return tablet;
  return desktop;
};
