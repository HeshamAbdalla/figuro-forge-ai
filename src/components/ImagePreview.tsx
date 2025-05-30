
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, Image, Wand2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImagePreviewProps {
  imageSrc: string | null;
  isLoading: boolean;
  onConvertTo3D: () => void;
  isConverting: boolean;
  generationMethod?: "edge" | "direct" | null;
}

const ImagePreview = ({ 
  imageSrc, 
  isLoading, 
  onConvertTo3D, 
  isConverting, 
  generationMethod 
}: ImagePreviewProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  if (!imageSrc && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-full min-h-[300px] sm:min-h-[400px]"
      >
        <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-medium">Generated Image</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-figuro-accent/20 text-figuro-accent">Step 2</span>
        </div>
        <div className="relative aspect-square flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 sm:p-8 flex flex-col items-center justify-center w-full h-full">
            <Image className="text-white/30 mb-4 w-12 h-12 sm:w-16 sm:h-16" />
            <p className="text-white/50 mb-2 text-sm sm:text-base">No image generated yet</p>
            <p className="text-xs text-white/30">Complete Step 1 to generate your figurine image</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  const handleSaveImage = () => {
    if (!imageSrc) return;
    
    try {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = imageSrc;
      a.download = `figurine-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Image saved",
        description: "The image has been saved to your device",
      });
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "Error saving image",
        description: "There was an error saving the image",
        variant: "destructive",
      });
    }
  };

  const handleImageError = () => {
    console.error("Error loading image:", imageSrc);
    setImageError(true);
    toast({
      title: "Error loading image",
      description: "There was an error loading the image. Try generating a new one.",
      variant: "destructive",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-full"
    >
      <div className="p-3 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-base sm:text-lg font-medium">Generated Image</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-figuro-accent/20 text-figuro-accent">Step 2</span>
          {imageSrc && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="border-green-400/30 bg-green-400/10 text-green-400 text-xs rounded-full px-2.5 py-0.5 inline-flex items-center">
                    <Share2 size={10} className="mr-1" /> Public
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This image will appear in the community gallery</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {generationMethod && (
            <div className="border-white/20 text-xs rounded-full px-2.5 py-0.5 inline-flex items-center">
              {generationMethod === "edge" ? "Edge Function" : "Direct API"}
            </div>
          )}
          {imageSrc && !imageError && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 hover:border-white/40 bg-white/5 h-6 sm:h-8 text-xs"
              onClick={handleSaveImage}
            >
              <Download size={12} className="mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative aspect-square">
        {isLoading ? (
          <div className="w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Skeleton className="w-full h-full rounded-lg bg-white/5 loading-shine" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Wand2 className="text-figuro-accent h-8 w-8 sm:h-12 sm:w-12 mb-4 animate-pulse" />
                <p className="text-white/70 text-sm sm:text-base">Generating your image...</p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full p-2 sm:p-4"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Generated figurine"
                className="w-full h-full object-contain rounded-lg shadow-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                No image generated yet
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center p-4">
                  <p className="text-red-400 mb-2">Error loading image</p>
                  <p className="text-sm text-white/70">Try generating a new image</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <Button
          className={`w-full bg-figuro-accent hover:bg-figuro-accent-hover flex items-center justify-center gap-2 group ${
            isMobile ? 'h-10' : 'h-12'
          }`}
          onClick={onConvertTo3D}
          disabled={!imageSrc || isConverting || isLoading || imageError}
        >
          {isConverting ? (
            <>
              <span className="text-sm sm:text-base">Converting...</span>
              <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base transform group-hover:scale-105 transition-transform">Convert to 3D</span>
              <Wand2 size={isMobile ? 14 : 16} className="group-hover:rotate-12 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default ImagePreview;
