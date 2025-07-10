"use client";

import React, { useState, useRef } from "react";
import { motion, MotionConfigContext, LayoutGroup } from "framer-motion";

// Types
interface Props {
  heading?: string;
  text?: string;
  variant?: "Default" | "Hover";
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onClick?: () => void;
}

// Transitions
const transition1 = {
  bounce: 0,
  delay: 0,
  duration: 0.4,
  type: "spring" as const
};

const transition2 = {
  delay: 0,
  duration: 0.4,
  ease: "easeInOut",
  type: "tween" as const
};

const transformTemplate1 = (_: any, t: string) => `translate(-50%, -50%) ${t}`;

// Transition wrapper component
const Transition: React.FC<{ value: any; children: React.ReactNode }> = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext);
  const transition = value ?? config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)]);

  return (
    <MotionConfigContext.Provider value={contextValue}>
      {children}
    </MotionConfigContext.Provider>
  );
};

const Variants = motion.create(React.Fragment);

export const IconHover3D: React.FC<Props> = ({
  heading = "Library",
  text = "A comprehensive collection of digital books and resources for learning and research.",
  variant = "Default",
  className = "",
  style = {},
  width = 600,
  height = 150,
  onClick,
  ...restProps
}) => {
  const [currentVariant, setCurrentVariant] = useState<"Default" | "Hover">(variant);
  const [gestureState, setGestureState] = useState({ isHovered: false });
  const refBinding = useRef<HTMLDivElement>(null);
  const defaultLayoutId = React.useId();

  const isHoverVariant = currentVariant === "Hover";
  const variants = [currentVariant === "Default" ? "GPnJri30y" : "zEwHlJ7zp"];

  const handleMouseEnter = async () => {
    setGestureState({ isHovered: true });
    setCurrentVariant("Hover");
  };

  const handleMouseLeave = async () => {
    setGestureState({ isHovered: false });
    setCurrentVariant("Default");
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cubeSliceVariants = {
    zEwHlJ7zp: {
      "--border-color": "hsl(var(--primary))"
    }
  };

  const titleTransition = {
    duration: 0.3,
    ease: "easeInOut",
    type: "tween" as const
  };

  const sliceCubeVariants = {
    zEwHlJ7zp: {
      rotateX: -28,
      rotateY: -43,
      scale: 1.1
    }
  };

  const cornerScaleVariants = {
    zEwHlJ7zp: {
      scale: 2.2
    }
  };

  return (
    <div style={{ width, height }}>
      <LayoutGroup id={defaultLayoutId}>
        <Variants animate={variants} initial={false}>
          <Transition value={transition1}>
            <motion.div
              {...restProps}
              className={`icon-hover-3d cursor-pointer ${className}`}
              data-framer-name="Default"
              data-highlight={true}
              ref={refBinding}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={currentVariant === "Hover" ? handleMouseLeave : undefined}
              onClick={handleClick}
              style={{
                backgroundColor: "hsl(var(--background))",
                alignContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "40px",
                height: "min-content",
                justifyContent: "center",
                overflow: "visible",
                padding: "20px",
                position: "relative",
                width: "min-content",
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                ...style
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon Container */}
              <motion.div
                className="icon-container"
                data-framer-name="Icon"
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flex: "none",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  gap: "10px",
                  height: "100px",
                  justifyContent: "center",
                  overflow: "visible",
                  padding: "0px",
                  position: "relative",
                  width: "100px",
                  zIndex: 1,
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              >
                {/* BG Container */}
                <motion.div
                  className="bg-container"
                  data-framer-name="BG"
                  style={{
                    flex: "none",
                    height: "348px",
                    overflow: "visible",
                    position: "relative",
                    width: "348px",
                    zIndex: 2,
                    scale: 0.3
                  }}
                >
                  {/* Slice Cube */}
                  <motion.div
                    className="slice-cube"
                    data-framer-name="Slice Cube"
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flex: "none",
                      flexDirection: "column",
                      flexWrap: "nowrap",
                      gap: "28px",
                      height: "min-content",
                      justifyContent: "center",
                      left: "50%",
                      overflow: "visible",
                      padding: "0px",
                      position: "absolute",
                      top: "50%",
                      transformStyle: "preserve-3d",
                      width: "min-content",
                      zIndex: 3,
                      rotate: 49,
                      rotateX: 23,
                      rotateY: 33,
                      scale: 0.7,
                      transformPerspective: 1200
                    }}
                    transformTemplate={transformTemplate1}
                    variants={sliceCubeVariants}
                    animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                  >
                    {/* Slice 1 */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-1"
                        data-framer-name="Slice 1"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px",
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid hsl(var(--foreground))",
                            backgroundColor: "hsl(var(--background))",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                        />
                      </motion.div>
                    </Transition>

                    {/* Slice 2 - Similar structure */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-2"
                        data-framer-name="Slice 2"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px", border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                      </motion.div>
                    </Transition>

                    {/* Slice 3 - Similar structure */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-3"
                        data-framer-name="Slice 3"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px", border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                      </motion.div>
                    </Transition>
                  </motion.div>

                  {/* Corner elements */}
                  <motion.div
                    style={{
                      flex: "none",
                      height: "24px",
                      left: isHoverVariant ? "-6px" : "14px",
                      overflow: "hidden",
                      position: "absolute",
                      top: isHoverVariant ? "-6px" : "14px",
                      width: "24px",
                      zIndex: 2,
                      borderLeft: "4px solid hsl(var(--foreground))",
                      borderTop: "4px solid hsl(var(--foreground))",
                      scale: 1
                    }}
                    variants={cornerScaleVariants}
                    animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                  />
                  <motion.div
                    style={{
                      flex: "none",
                      height: "24px",
                      left: isHoverVariant ? "-6px" : "14px",
                      overflow: "hidden",
                      position: "absolute",
                      top: isHoverVariant ? "330px" : "310px",
                      width: "24px",
                      zIndex: 2,
                      borderLeft: "4px solid hsl(var(--foreground))",
                      borderBottom: "4px solid hsl(var(--foreground))",
                      scale: 1
                    }}
                    variants={cornerScaleVariants}
                    animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                  />
                  <motion.div
                    style={{
                      bottom: isHoverVariant ? "-6px" : "14px",
                      flex: "none",
                      height: "24px",
                      overflow: "hidden",
                      position: "absolute",
                      right: isHoverVariant ? "-6px" : "14px",
                      width: "24px",
                      zIndex: 2,
                      borderRight: "4px solid hsl(var(--foreground))",
                      borderBottom: "4px solid hsl(var(--foreground))",
                      scale: 1
                    }}
                    variants={cornerScaleVariants}
                    animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                  />
                  <motion.div
                    style={{
                      flex: "none",
                      height: "24px",
                      overflow: "hidden",
                      position: "absolute",
                      right: isHoverVariant ? "-6px" : "14px",
                      top: isHoverVariant ? "-6px" : "14px",
                      width: "24px",
                      zIndex: 2,
                      borderRight: "4px solid hsl(var(--foreground))",
                      borderTop: "4px solid hsl(var(--foreground))",
                      scale: 1
                    }}
                    variants={cornerScaleVariants}
                    animate={isHoverVariant ? "zEwHlJ7zp" : "default"}
                  />
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div
                className="content"
                data-framer-name="Content"
                style={{
                  alignContent: "flex-start",
                  alignItems: "flex-start",
                  display: "flex",
                  flex: "none",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  gap: "12px",
                  height: "min-content",
                  justifyContent: "center",
                  maxWidth: "400px",
                  overflow: "hidden",
                  padding: "0px",
                  position: "relative",
                  width: "min-content"
                }}
              >
                {/* Text Container */}
                <motion.div
                  className="text-container"
                  data-framer-name="Text"
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flex: "none",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    gap: "10px",
                    height: "32px",
                    justifyContent: "center",
                    overflow: "visible",
                    padding: "0px",
                    position: "relative",
                  }}
                >
                  {/* Heading Text with hover effect */}
                  <motion.div
                    style={{
                      flex: "none",
                      height: "32px",
                      position: "relative",
                      whiteSpace: "pre",
                      width: "auto",
                      fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                      fontWeight: "600",
                      fontSize: "18px",
                      color: "hsl(var(--foreground))",
                      userSelect: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden"
                    }}
                  >
                    {/* Background text */}
                    <span className="mx-1 text-center" style={{ position: "relative", zIndex: 1 }}>
                      {heading}
                    </span>

                    {/* Animated overlay text */}
                    <motion.span
                      className="mx-1 mt-0.5 text-center"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        color: "hsl(var(--background))",
                        clipPath: `inset(0 ${isHoverVariant ? "0%" : "100%"} 0 0)`,
                        zIndex: 2
                      }}
                      animate={{
                        clipPath: `inset(0 ${isHoverVariant ? "0%" : "100%"} 0 0)`
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {heading}
                    </motion.span>

                    {/* Background fill */}
                    <motion.div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "hsl(var(--foreground))",
                        transformOrigin: "left center",
                        scaleX: 0,
                        zIndex: 1
                      }}
                      animate={{
                        scaleX: isHoverVariant ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>

                {/* Description Text */}
                <motion.div
                  style={{
                    flex: "none",
                    height: "auto",
                    position: "relative",
                    whiteSpace: "pre-wrap",
                    width: "400px",
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontWeight: "400",
                    fontSize: "16px",
                    lineHeight: "1.5em",
                    color: "hsl(var(--muted-foreground))",
                    userSelect: "none"
                  }}
                >
                  {text}
                </motion.div>
              </motion.div>
            </motion.div>
          </Transition>
        </Variants>
      </LayoutGroup>
    </div>
  );
};
