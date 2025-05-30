
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2, Download, Info, ZoomIn, ZoomOut, RotateCw, Loader2, MoreHorizontal } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogClose 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

const EnhancedImageViewerDialog: React.FC<EnhancedImageViewerDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  fileName,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use the secure download hook
  const { secureDownload, isDownloading, authPromptOpen, setAuthPromptOpen, isAuthenticated } = useSecureDownload();

  // Handle dialog close with cleanup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      resetView();
    }
    onOpenChange(newOpen);
  };

  // Reset view state
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsFullscreen(false);
    setIsInfoVisible(false);
    setIsLoading(true);
    setImageError(false);
  };

  // Reset image position and zoom
  const resetImage = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    toast({
      title: "Image reset",
      description: "Image position and zoom have been reset"
    });
  };

  // Zoom functions
  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.1));
  };

  // Rotate image
  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Secure download image
  const downloadImage = async () => {
    if (!imageUrl) {
      toast({
        title: "Download failed",
        description: "No image URL available",
        variant: "destructive"
      });
      return;
    }

    const imageName = fileName || (imageUrl ? 
      imageUrl.split('/').pop()?.split('?')[0] || 'image.png' : 
      'image.png');

    console.log('🔄 [IMAGE-VIEWER] Starting secure download:', imageName);
    
    try {
      await secureDownload(imageUrl, imageName);
    } catch (error) {
      console.error('❌ [IMAGE-VIEWER] Secure download failed:', error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the image",
        variant: "destructive"
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetImage();
          break;
        case 'r':
        case 'R':
          rotateImage();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'i':
        case 'I':
          setIsInfoVisible(!isInfoVisible);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isFullscreen, isInfoVisible]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      resetView();
    }
  }, [open]);

  const imageName = fileName || (imageUrl ? 
    imageUrl.split('/').pop()?.split('?')[0] || 'Image' : 
    'Image');

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          ref={dialogRef}
          className={cn(
            "p-0 border border-white/10 overflow-hidden transition-all duration-300 [&>button]:hidden",
            isFullscreen 
              ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-[100]" 
              : "sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full max-w-6xl bg-gray-900/95 backdrop-blur-sm rounded-xl"
          )}
          style={{
            width: isFullscreen ? '100vw' : undefined,
            height: isFullscreen ? '100vh' : undefined,
            maxWidth: isFullscreen ? '100vw' : undefined,
            maxHeight: isFullscreen ? '100vh' : undefined,
          }}
        >
          {/* Enhanced Responsive Header */}
          <DialogHeader className="relative p-2 sm:p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-lg font-semibold text-white truncate flex-1 min-w-0">
                {imageName}
              </h2>
              
              {/* Mobile and Desktop Control Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Always visible essential buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={downloadImage}
                  className="h-6 w-6 sm:h-8 sm:w-8 text-white/70 hover:text-white hover:bg-white/10"
                  title={isAuthenticated ? "Download Image" : "Sign in to Download"}
                  disabled={!imageUrl || isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 size={12} className="sm:size-4 animate-spin" />
                  ) : (
                    <Download size={12} className="sm:size-4" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="h-6 w-6 sm:h-8 sm:w-8 text-white/70 hover:text-white hover:bg-white/10"
                  title="Close (Esc)"
                >
                  <X size={12} className="sm:size-4" />
                </Button>

                {/* Desktop buttons - hidden on mobile */}
                {!isMobile && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsInfoVisible(!isInfoVisible)}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title="Image Information (I)"
                    >
                      <Info size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={zoomIn}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title="Zoom In (+)"
                      disabled={zoom >= 5}
                    >
                      <ZoomIn size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={zoomOut}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title="Zoom Out (-)"
                      disabled={zoom <= 0.1}
                    >
                      <ZoomOut size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={rotateImage}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title="Rotate (R)"
                    >
                      <RotateCw size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetImage}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title="Reset View (0)"
                    >
                      <RotateCw size={16} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </Button>
                  </>
                )}

                {/* Mobile dropdown menu */}
                {isMobile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <MoreHorizontal size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                      <DropdownMenuItem onClick={() => setIsInfoVisible(!isInfoVisible)}>
                        <Info size={14} className="mr-2" />
                        {isInfoVisible ? "Hide Info" : "Show Info"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={zoomIn} disabled={zoom >= 5}>
                        <ZoomIn size={14} className="mr-2" />
                        Zoom In
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={zoomOut} disabled={zoom <= 0.1}>
                        <ZoomOut size={14} className="mr-2" />
                        Zoom Out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={rotateImage}>
                        <RotateCw size={14} className="mr-2" />
                        Rotate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={resetImage}>
                        <RotateCw size={14} className="mr-2" />
                        Reset View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 size={14} className="mr-2" /> : <Maximize2 size={14} className="mr-2" />}
                        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Responsive Image Info Panel */}
            {isInfoVisible && (
              <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs sm:text-sm text-white/80 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-white/60 font-medium">File:</span> 
                    <span className="break-all">{imageName}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs">
                    <div><span className="text-white/60">Type:</span> Image</div>
                    <div><span className="text-white/60">Zoom:</span> {Math.round(zoom * 100)}%</div>
                    <div><span className="text-white/60">Rotation:</span> {rotation}°</div>
                    <div><span className="text-white/60">Auth:</span> {isAuthenticated ? 'Signed in' : 'Not signed in'}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60">
                    <span className="hidden sm:inline">Controls: Click and drag to pan when zoomed, scroll to zoom</span>
                    <span className="sm:hidden">Tap and drag to pan when zoomed</span>
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Image Viewer Content */}
          <div className={cn(
            "relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden",
            isFullscreen ? "h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)]" : "h-[50vh] sm:h-[70vh] min-h-[300px] sm:min-h-[400px]"
          )}>
            {imageUrl ? (
              <div 
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={imageName}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    cursor: zoom > 1 ? 'grab' : 'default'
                  }}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    setImageError(true);
                  }}
                  draggable={false}
                />
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white/70 text-sm">Loading image...</p>
                    </div>
                  </div>
                )}
                
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={16} className="sm:size-6 text-red-400" />
                      </div>
                      <p className="text-white/70 text-sm">Failed to load image</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/70">No image selected</p>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Footer */}
          <div className="p-2 sm:p-4 border-t border-white/10 bg-gray-900/90 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-white/60">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="font-medium">Interactive Image Viewer</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs">{isAuthenticated ? 'Secure downloads enabled' : 'Sign in for downloads'}</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 text-xs">
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                {isDownloading && (
                  <span className="text-blue-400">Downloading...</span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Prompt Modal - handled by useSecureDownload hook */}
      {authPromptOpen && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-lg border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Authentication Required</h3>
            <p className="text-white/70 mb-6 text-sm">You must be signed in to download images from the gallery.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setAuthPromptOpen(false);
                  window.location.href = '/auth';
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setAuthPromptOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedImageViewerDialog;
