
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Wand2, Image as ImageIcon, ArrowRight, Settings, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { globalPerformanceMonitor, PerformanceStats } from "@/components/model-viewer/utils/performanceMonitor";

interface StreamlinedImagePreviewProps {
  imageSrc: string | null;
  isLoading: boolean;
  onConvertTo3D: () => void;
  onOpenConfig: () => void;
  isConverting: boolean;
  enablePerformanceMonitoring?: boolean;
}

const StreamlinedImagePreview = ({ 
  imageSrc, 
  isLoading, 
  onConvertTo3D, 
  onOpenConfig,
  isConverting,
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development'
}: StreamlinedImagePreviewProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState<boolean>(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState<boolean>(false);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const isMobile = useIsMobile();

  // Initialize performance monitoring if enabled
  React.useEffect(() => {
    if (enablePerformanceMonitoring) {
      const handlePerformanceUpdate = (stats: PerformanceStats) => {
        setPerformanceStats(stats);
      };

      globalPerformanceMonitor.addCallback(handlePerformanceUpdate);
      
      return () => {
        globalPerformanceMonitor.removeCallback(handlePerformanceUpdate);
      };
    }
  }, [enablePerformanceMonitoring]);
  
  const handleSaveImage = () => {
    if (!imageSrc) return;
    
    try {
      const a = document.createElement('a');
      a.href = imageSrc;
      a.download = `figurine-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded",
        description: "Image saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save image",
        variant: "destructive",
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
    toast({
      title: "Error",
      description: "Failed to load image",
      variant: "destructive",
    });
  };

  const handleConvertTo3D = () => {
    // Start performance monitoring when 3D conversion begins
    if (enablePerformanceMonitoring) {
      globalPerformanceMonitor.start();
    }
    onConvertTo3D();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-fit relative"
    >
      {/* Performance Stats Overlay */}
      {enablePerformanceMonitoring && showPerformanceStats && performanceStats && (
        <div className="absolute top-12 left-2 z-10 bg-black/90 text-white text-xs p-2 rounded font-mono border border-white/20">
          <div className="flex items-center gap-1 mb-1">
            <Activity size={10} />
            <span>Performance</span>
          </div>
          <div>FPS: {performanceStats.fps.toFixed(1)}</div>
          <div>Render: {performanceStats.renderTime.toFixed(1)}ms</div>
          <div>Memory: {performanceStats.memoryUsage.toFixed(1)}MB</div>
        </div>
      )}

      <div className="p-2 sm:p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <ImageIcon size={isMobile ? 16 : 20} className="text-figuro-accent" />
            Preview
          </h3>
          
          {/* Performance Monitor Toggle (Development) */}
          {enablePerformanceMonitoring && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformanceStats(!showPerformanceStats)}
              className={`h-6 w-6 p-1 ${showPerformanceStats ? 'text-figuro-accent' : 'text-white/50'}`}
              title="Toggle Performance Stats"
            >
              <Activity size={12} />
            </Button>
          )}
        </div>
        
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          {isLoading ? "Generating your image..." : 
           imageSrc ? "Ready to convert to 3D" : 
           "Your generated image will appear here"}
        </p>
      </div>

      <div className="aspect-square relative">
        {isLoading ? (
          <div className="w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg bg-white/5 loading-shine" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wand2 className="text-figuro-accent h-6 w-6 sm:h-8 sm:w-8 mb-2" />
              </motion.div>
              <p className="text-white/70 text-xs sm:text-sm">Creating magic...</p>
              <div className="w-24 sm:w-32 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                <motion.div
                  className="h-full bg-figuro-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        ) : imageSrc ? (
          <div className="w-full h-full p-1 sm:p-2">
            <img
              src={imageSrc}
              alt="Generated figurine"
              className="w-full h-full object-contain rounded-lg"
              onError={handleImageError}
            />
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                <p className="text-red-400 text-xs sm:text-sm">Failed to load</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <div className="text-center text-white/30">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ImageIcon size={isMobile ? 32 : 48} className="mx-auto mb-3" />
              </motion.div>
              <p className="text-xs sm:text-sm">Your artwork will appear here</p>
              <p className="text-xs mt-1 text-white/20">Start by generating an image</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-2 sm:p-3 space-y-2">
        {imageSrc && !imageError && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveImage}
            className={`w-full border-white/20 hover:border-white/40 bg-white/5 ${isMobile ? 'h-7 text-xs' : 'h-8'}`}
          >
            <Download size={isMobile ? 12 : 14} className="mr-1" />
            Save Image
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConfig}
            disabled={!imageSrc || isConverting || isLoading || imageError}
            className={`border-white/20 hover:border-white/40 bg-white/5 ${isMobile ? 'h-8 px-2' : 'h-9'}`}
          >
            <Settings size={isMobile ? 12 : 14} className="mr-1" />
            <span className={isMobile ? 'text-xs' : ''}>Config</span>
          </Button>
          
          <Button
            onClick={handleConvertTo3D}
            disabled={!imageSrc || isConverting || isLoading || imageError}
            className={`flex-1 bg-figuro-accent hover:bg-figuro-accent-hover font-medium ${isMobile ? 'h-8 text-xs' : 'h-9'}`}
          >
            {isConverting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isMobile ? 'Converting...' : 'Converting...'}
              </>
            ) : (
              <>
                <Wand2 size={isMobile ? 12 : 16} className="mr-2" />
                <span className="hidden sm:inline">Convert to 3D</span>
                <span className="sm:hidden">Convert</span>
                <ArrowRight size={isMobile ? 10 : 14} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StreamlinedImagePreview;
