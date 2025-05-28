
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Box } from 'lucide-react';
import { Figurine } from '@/types/figurine';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MiniGalleryCarouselProps {
  figurines: Figurine[];
  onCreateNew: () => void;
  className?: string;
}

const MiniGalleryCarousel = ({ 
  figurines, 
  onCreateNew, 
  className = "" 
}: MiniGalleryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Show max 3 items at a time
  const visibleCount = Math.min(3, figurines.length);
  const hasItems = figurines.length > 0;
  
  const nextSlide = () => {
    if (figurines.length > visibleCount) {
      setCurrentIndex((prev) => 
        prev + 1 >= figurines.length - visibleCount + 1 ? 0 : prev + 1
      );
    }
  };

  const prevSlide = () => {
    if (figurines.length > visibleCount) {
      setCurrentIndex((prev) => 
        prev === 0 ? figurines.length - visibleCount : prev - 1
      );
    }
  };

  const getVisibleItems = () => {
    if (!hasItems) return [];
    return figurines.slice(currentIndex, currentIndex + visibleCount);
  };

  if (!hasItems) {
    return (
      <Card className={`glass-panel border-white/20 backdrop-blur-sm p-4 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
            <Plus size={24} className="text-white/60" />
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Your Gallery</h3>
          <p className="text-xs text-white/60 mb-3">No figurines yet</p>
          <Button 
            onClick={onCreateNew}
            size="sm"
            className="bg-figuro-accent hover:bg-figuro-accent-hover h-8"
          >
            Create First Figurine
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass-panel border-white/20 backdrop-blur-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/80">Recent Creations</h3>
        <div className="flex gap-1">
          {figurines.length > visibleCount && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronRight size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {getVisibleItems().map((figurine, index) => {
          const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
          
          return (
            <motion.div
              key={`${figurine.id}-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative group cursor-pointer"
            >
              <AspectRatio ratio={1} className="bg-black/20 rounded-lg overflow-hidden">
                {figurine.saved_image_url || figurine.image_url ? (
                  <img 
                    src={figurine.saved_image_url || figurine.image_url}
                    alt={figurine.title || "Figurine"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    {isTextTo3D ? (
                      <Box size={16} className="text-figuro-accent" />
                    ) : (
                      <Sparkles size={16} className="text-white/40" />
                    )}
                  </div>
                )}
                
                {/* Overlay badges */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-center">
                    {figurine.model_url && (
                      <Box size={14} className="text-figuro-accent mx-auto mb-1" />
                    )}
                    {isTextTo3D && (
                      <Sparkles size={14} className="text-figuro-accent mx-auto mb-1" />
                    )}
                  </div>
                </div>
              </AspectRatio>
              
              <div className="mt-1">
                <p className="text-xs text-white/70 truncate">
                  {figurine.title || "Untitled"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <Button 
        onClick={onCreateNew}
        variant="outline"
        size="sm"
        className="w-full mt-3 h-8 border-white/20 hover:border-white/40 bg-white/5 text-white/80"
      >
        <Plus size={14} className="mr-1" />
        Create New
      </Button>
    </Card>
  );
};

export default MiniGalleryCarousel;
