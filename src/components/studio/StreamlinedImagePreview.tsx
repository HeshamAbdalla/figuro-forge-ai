
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Wand2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StreamlinedImagePreviewProps {
  imageSrc: string | null;
  isLoading: boolean;
  onConvertTo3D: () => void;
  isConverting: boolean;
}

const StreamlinedImagePreview = ({ 
  imageSrc, 
  isLoading, 
  onConvertTo3D, 
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
      <div className="aspect-square relative">
        {isLoading ? (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg bg-white/5 loading-shine" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Wand2 className="text-figuro-accent h-8 w-8 mb-2 animate-pulse" />
              <p className="text-white/70 text-sm">Generating...</p>
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
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/30">
              <ImageIcon size={32} className="mx-auto mb-2" />
              <p className="text-sm">No image yet</p>
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
            Save
          </Button>
        )}
        
        <Button
          onClick={onConvertTo3D}
          disabled={!imageSrc || isConverting || isLoading || imageError}
          className="w-full bg-figuro-accent hover:bg-figuro-accent-hover h-8"
        >
          {isConverting ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Converting...
            </>
          ) : (
            <>
              <Wand2 size={14} className="mr-1" />
              Convert to 3D
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default StreamlinedImagePreview;
