
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Wand2, Image as ImageIcon, ArrowRight, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StreamlinedImagePreviewProps {
  imageSrc: string | null;
  isLoading: boolean;
  onConvertTo3D: () => void;
  onOpenConfig: () => void;
  isConverting: boolean;
}

const StreamlinedImagePreview = ({ 
  imageSrc, 
  isLoading, 
  onConvertTo3D, 
  onOpenConfig,
  isConverting 
}: StreamlinedImagePreviewProps) => {
  const { toast } = useToast();
  const [imageError, setImageError] = useState<boolean>(false);
  
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/20 h-fit"
    >
      <div className="p-3 border-b border-white/10">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <ImageIcon size={20} className="text-figuro-accent" />
          Preview
        </h3>
        <p className="text-sm text-white/60 mt-1">
          {isLoading ? "Generating your image..." : 
           imageSrc ? "Ready to convert to 3D" : 
           "Your generated image will appear here"}
        </p>
      </div>

      <div className="aspect-square relative">
        {isLoading ? (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg bg-white/5 loading-shine" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wand2 className="text-figuro-accent h-8 w-8 mb-2" />
              </motion.div>
              <p className="text-white/70 text-sm">Creating magic...</p>
              <div className="w-32 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
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
          <div className="w-full h-full p-2">
            <img
              src={imageSrc}
              alt="Generated figurine"
              className="w-full h-full object-contain rounded-lg"
              onError={handleImageError}
            />
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                <p className="text-red-400 text-sm">Failed to load</p>
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
                <ImageIcon size={48} className="mx-auto mb-3" />
              </motion.div>
              <p className="text-sm">Your artwork will appear here</p>
              <p className="text-xs mt-1 text-white/20">Start by generating an image</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 space-y-2">
        {imageSrc && !imageError && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveImage}
            className="w-full border-white/20 hover:border-white/40 bg-white/5 h-8"
          >
            <Download size={14} className="mr-1" />
            Save Image
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConfig}
            disabled={!imageSrc || isConverting || isLoading || imageError}
            className="border-white/20 hover:border-white/40 bg-white/5 h-9"
          >
            <Settings size={14} className="mr-1" />
            Config
          </Button>
          
          <Button
            onClick={onConvertTo3D}
            disabled={!imageSrc || isConverting || isLoading || imageError}
            className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover h-9 font-medium"
          >
            {isConverting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Converting...
              </>
            ) : (
              <>
                <Wand2 size={16} className="mr-2" />
                Convert to 3D
                <ArrowRight size={14} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StreamlinedImagePreview;
