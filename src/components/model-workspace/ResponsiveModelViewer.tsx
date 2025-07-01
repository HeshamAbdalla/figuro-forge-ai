
import React, { useState } from "react";
import { RotateCcw, Maximize2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import ModelViewer from "@/components/model-viewer";
import { useResponsiveMobile } from "@/hooks/useResponsiveMobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ResponsiveModelViewerProps {
  modelUrl: string | null;
  imageUrl: string;
  title: string;
  className?: string;
}

const ResponsiveModelViewer: React.FC<ResponsiveModelViewerProps> = ({
  modelUrl,
  imageUrl,
  title,
  className
}) => {
  const { isMobile, orientation } = useResponsiveMobile();
  const { toast } = useToast();
  const [autoRotate, setAutoRotate] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [brightness, setBrightness] = useState([1]);

  const resetCamera = () => {
    // This would integrate with the actual ModelViewer component's reset functionality
    toast({
      title: "Camera Reset",
      description: "Model view has been reset to default position"
    });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const viewerHeight = isMobile 
    ? (orientation === 'portrait' ? 'h-[50vh]' : 'h-[60vh]')
    : 'h-full';

  return (
    <Card className={cn(
      "bg-gray-900/50 border-white/10 overflow-hidden relative",
      viewerHeight,
      className
    )}>
      {/* Mobile Control Bar */}
      {isMobile && (
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCamera}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 p-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 p-2"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-figuro-dark border-white/10 max-h-[60vh]">
              <div className="space-y-6 pt-4">
                <h3 className="text-lg font-semibold text-white">Viewer Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Auto Rotate</span>
                    <Switch
                      checked={autoRotate}
                      onCheckedChange={setAutoRotate}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Wireframe Mode</span>
                    <Switch
                      checked={showWireframe}
                      onCheckedChange={setShowWireframe}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-white/80">Lighting</span>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      max={2}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Model Viewer Content */}
      <div className="w-full h-full">
        {modelUrl ? (
          <ModelViewer
            modelUrl={modelUrl}
            isLoading={false}
            variant="gallery"
            showControls={!isMobile}
            autoRotate={autoRotate}
            fillHeight={true}
            className="w-full h-full [&_.glass-panel]:bg-transparent [&_.glass-panel]:border-0 [&_.glass-panel]:rounded-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center p-6">
              <img 
                src={imageUrl} 
                alt={title}
                className="max-w-full max-h-80 mx-auto rounded-lg shadow-2xl object-contain"
                style={{ maxHeight: isMobile ? '200px' : '320px' }}
              />
              <p className="text-white/60 mt-4 text-sm">2D Preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Touch Gesture Hints for Mobile */}
      {isMobile && (
        <div className="absolute bottom-2 left-2 text-xs text-white/50 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
          Pinch to zoom • Drag to rotate
        </div>
      )}
    </Card>
  );
};

export default ResponsiveModelViewer;
