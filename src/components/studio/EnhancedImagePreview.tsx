
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, Image, Wand2, ZoomIn, ZoomOut, RotateCw, Maximize2, Info, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface EnhancedImagePreviewProps {
  imageSrc: string | null;
  isLoading: boolean;
  onConvertTo3D: () => void;
  isConverting: boolean;
  generationMethod?: "edge" | "direct" | null;
  className?: string;
  enableGestures?: boolean;
  showMetadata?: boolean;
  autoOptimize?: boolean;
}

interface ImageMetadata {
  dimensions?: { width: number; height: number };
  fileSize?: string;
  format?: string;
  colorSpace?: string;
}

const EnhancedImagePreview: React.FC<EnhancedImagePreviewProps> = ({
  imageSrc,
  isLoading,
  onConvertTo3D,
  isConverting,
  generationMethod,
  className,
  enableGestures = true,
  showMetadata = false,
  autoOptimize = true
}) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<ImageMetadata>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Motion values for smooth interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useSpring(1, { stiffness: 300, damping: 30 });
  const rotateValue = useSpring(0, { stiffness: 300, damping: 30 });
  
  // Transform values for advanced animations
  const opacity = useTransform(scale, [0.8, 1], [0.8, 1]);
  const blurValue = useTransform(scale, [1, 1.2], [0, 2]);

  // Optimized image URL with auto-optimization
  const optimizedImageUrl = useMemo(() => {
    if (!imageSrc || !autoOptimize) return imageSrc;
    
    try {
      const url = new URL(imageSrc);
      // Add optimization parameters for supported services
      if (url.hostname.includes('supabase') || url.hostname.includes('cloudinary')) {
        url.searchParams.set('w', isMobile ? '800' : '1200');
        url.searchParams.set('q', '85');
        url.searchParams.set('f', 'auto');
      }
      return url.toString();
    } catch {
      return imageSrc;
    }
  }, [imageSrc, autoOptimize, isMobile]);

  // Load image metadata
  const loadImageMetadata = useCallback((img: HTMLImageElement) => {
    setMetadata({
      dimensions: { width: img.naturalWidth, height: img.naturalHeight },
      format: imageSrc?.split('.').pop()?.toUpperCase() || 'Unknown',
      fileSize: 'Unknown' // Would need actual file size from server
    });
  }, [imageSrc]);

  // Enhanced image loading with error handling
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageLoaded(true);
    setImageError(false);
    loadImageMetadata(img);
  }, [loadImageMetadata]);

  const handleImageError = useCallback(() => {
    console.error("Error loading image:", optimizedImageUrl);
    setImageError(true);
    setImageLoaded(false);
    toast({
      title: "Error loading image",
      description: "There was an error loading the image. Try generating a new one.",
      variant: "destructive",
    });
  }, [optimizedImageUrl, toast]);

  // Enhanced save functionality with better error handling
  const handleSaveImage = useCallback(async () => {
    if (!optimizedImageUrl) return;
    
    try {
      // Use fetch with better error handling
      const response = await fetch(optimizedImageUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `figurine-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Image saved",
        description: "The image has been saved to your device",
      });
    } catch (error) {
      console.error("Error saving image:", error);
      
      // Fallback to simple download
      try {
        const a = document.createElement('a');
        a.href = optimizedImageUrl;
        a.download = `figurine-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Image saved",
          description: "The image has been saved to your device",
        });
      } catch (fallbackError) {
        toast({
          title: "Error saving image",
          description: "There was an error saving the image",
          variant: "destructive",
        });
      }
    }
  }, [optimizedImageUrl, toast]);

  // Advanced zoom functionality
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.25, 3);
    setZoom(newZoom);
    scale.set(newZoom);
  }, [zoom, scale]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.25, 0.5);
    setZoom(newZoom);
    scale.set(newZoom);
  }, [zoom, scale]);

  const handleRotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    rotateValue.set(newRotation);
  }, [rotation, rotateValue]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    scale.set(1);
    rotateValue.set(0);
    x.set(0);
    y.set(0);
  }, [scale, rotateValue, x, y]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Gesture handling for mobile
  const handlePanStart = useCallback(() => {
    if (enableGestures) {
      setIsDragging(true);
    }
  }, [enableGestures]);

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!imageSrc) return;
      
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          handleRotate();
          break;
        case '0':
          event.preventDefault();
          handleReset();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'i':
        case 'I':
          event.preventDefault();
          setShowInfo(!showInfo);
          break;
        case 's':
        case 'S':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleSaveImage();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageSrc, handleZoomIn, handleZoomOut, handleRotate, handleReset, toggleFullscreen, showInfo, handleSaveImage]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset states when image changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    handleReset();
  }, [optimizedImageUrl, handleReset]);

  // Early return for no image state
  if (!optimizedImageUrl && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-full min-h-[300px] sm:min-h-[400px]",
          className
        )}
      >
        <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-medium text-white">Generated Image</h3>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs px-2 py-1 rounded-full bg-figuro-accent/20 text-figuro-accent"
          >
            Step 2
          </motion.span>
        </div>
        <div className="relative aspect-square flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 sm:p-8 flex flex-col items-center justify-center w-full h-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Image className="text-white/30 mb-4 w-12 h-12 sm:w-16 sm:h-16" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/50 mb-2 text-sm sm:text-base"
            >
              No image generated yet
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-white/30"
            >
              Complete Step 1 to generate your figurine image
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-full",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Enhanced Header */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-base sm:text-lg font-medium text-white">Generated Image</h3>
        <div className="flex flex-wrap items-center gap-2">
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs px-2 py-1 rounded-full bg-figuro-accent/20 text-figuro-accent"
          >
            Step 2
          </motion.span>
          
          {optimizedImageUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="border-green-400/30 bg-green-400/10 text-green-400 text-xs rounded-full px-2.5 py-0.5 inline-flex items-center"
                  >
                    <Share2 size={10} className="mr-1" /> Public
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This image will appear in the community gallery</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {generationMethod && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="border-white/20 text-xs rounded-full px-2.5 py-0.5 inline-flex items-center text-white/70"
            >
              {generationMethod === "edge" ? "Edge Function" : "Direct API"}
            </motion.div>
          )}
          
          {/* Advanced Control Buttons */}
          {optimizedImageUrl && !imageError && (
            <div className="flex items-center gap-1">
              {!isMobile && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                          onClick={() => setShowInfo(!showInfo)}
                        >
                          <Info size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle image information (I)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                          onClick={handleZoomIn}
                          disabled={zoom >= 3}
                        >
                          <ZoomIn size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom in (+)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                          onClick={handleZoomOut}
                          disabled={zoom <= 0.5}
                        >
                          <ZoomOut size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom out (-)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                          onClick={handleRotate}
                        >
                          <RotateCw size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rotate image (R)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle fullscreen (F)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
                      onClick={handleSaveImage}
                    >
                      <Download size={12} className="mr-1" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save image (Ctrl+S)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {isFullscreen && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
              onClick={toggleFullscreen}
            >
              <X size={12} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Enhanced Image Info Panel */}
      <AnimatePresence>
        {showInfo && showMetadata && metadata.dimensions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-3 sm:px-4 py-2 border-b border-white/10 bg-white/5"
          >
            <div className="text-xs text-white/80 space-y-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><span className="text-white/60">Size:</span> {metadata.dimensions.width}×{metadata.dimensions.height}</div>
                <div><span className="text-white/60">Format:</span> {metadata.format}</div>
                <div><span className="text-white/60">Zoom:</span> {Math.round(zoom * 100)}%</div>
                <div><span className="text-white/60">Rotation:</span> {rotation}°</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/50">
        {isLoading ? (
          <div className="w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Skeleton className="w-full h-full rounded-lg bg-white/5" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="text-figuro-accent h-8 w-8 sm:h-12 sm:w-12 mb-4" />
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/70 text-sm sm:text-base"
                >
                  Generating your image...
                </motion.p>
                <motion.div
                  className="w-32 h-1 bg-white/10 rounded-full mt-4 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <motion.div
                    className="h-full bg-figuro-accent rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full p-2 sm:p-4 flex items-center justify-center"
          >
            {optimizedImageUrl && !imageError ? (
              <motion.img
                ref={imageRef}
                src={optimizedImageUrl}
                alt="Generated figurine"
                className={cn(
                  "max-w-full max-h-full object-contain rounded-lg shadow-lg transition-all duration-300",
                  isDragging && "cursor-grabbing",
                  zoom > 1 && "cursor-grab"
                )}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  filter: `blur(${blurValue}px)`,
                  opacity: opacity.get()
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                drag={enableGestures && zoom > 1}
                dragConstraints={containerRef}
                onDragStart={handlePanStart}
                onDragEnd={handlePanEnd}
                whileHover={{ scale: zoom * 1.02 }}
                whileTap={{ scale: zoom * 0.98 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: zoom, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                {imageError ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center p-4"
                  >
                    <X className="w-8 h-8 sm:w-12 sm:h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 mb-2">Error loading image</p>
                    <p className="text-sm text-white/70">Try generating a new image</p>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No image generated yet
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Enhanced Action Footer */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            className={cn(
              "w-full bg-figuro-accent hover:bg-figuro-accent-hover flex items-center justify-center gap-2 group transition-all duration-300",
              isMobile ? 'h-10' : 'h-12',
              isConverting && "animate-pulse"
            )}
            onClick={onConvertTo3D}
            disabled={!optimizedImageUrl || isConverting || isLoading || imageError}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isConverting ? (
              <>
                <span className="text-sm sm:text-base">Converting...</span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                />
              </>
            ) : (
              <>
                <motion.span 
                  className="text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Convert to 3D
                </motion.span>
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Wand2 size={isMobile ? 14 : 16} />
                </motion.div>
              </>
            )}
          </Button>
        </motion.div>
        
        {/* Mobile Gesture Hints */}
        {isMobile && enableGestures && optimizedImageUrl && !imageError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-2 text-center text-xs text-white/50"
          >
            Pinch to zoom • Double tap to reset • Long press for options
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedImagePreview;
