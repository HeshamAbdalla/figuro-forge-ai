
import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePublicFigurines } from "@/hooks/usePublicFigurines";
import { useToast } from "@/hooks/use-toast";
import { Figurine } from "@/types/figurine";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import FigurineModelDialog from "./FigurineModelDialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Play, User, Calendar } from "lucide-react";

const PublicFigurineGallery: React.FC = () => {
  const { figurines, loading, error } = usePublicFigurines();
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const { toast } = useToast();

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D Model Available",
        description: "This figurine doesn't have a 3D model yet.",
        variant: "destructive"
      });
      return;
    }
    setSelectedFigurine(figurine);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    img.src = "/placeholder.svg";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-figuro-accent hover:bg-figuro-accent-hover"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <EmptyState 
        title="No Public Models Yet"
        description="The community gallery is empty. Be the first to share your 3D creations!"
      />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {figurines.map((figurine, index) => (
          <motion.div
            key={figurine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel hover:scale-105 transition-transform duration-200 group">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={figurine.saved_image_url || figurine.image_url || "/placeholder.svg"}
                    alt={figurine.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={handleImageError}
                  />
                  
                  {/* Overlay with action buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 bg-white/20 backdrop-blur-sm border-0 hover:bg-white/30"
                        onClick={() => handleViewModel(figurine)}
                        title={figurine.model_url ? "View 3D Model" : "View Image"}
                      >
                        {figurine.model_url ? <Play size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {figurine.metadata?.conversion_type === 'text-to-3d' && (
                      <Badge className="bg-figuro-accent/80 text-white text-xs">
                        Text-to-3D
                      </Badge>
                    )}
                    {figurine.model_url && (
                      <Badge className="bg-blue-500/80 text-white text-xs">
                        3D Model
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 space-y-3">
                <div className="w-full space-y-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
                    {figurine.title}
                  </h3>
                  
                  {figurine.prompt && (
                    <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
                      {figurine.prompt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span className="truncate max-w-20">
                        {figurine.metadata?.creator_name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(figurine.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Model Viewer Dialog */}
      {selectedFigurine && (
        <FigurineModelDialog
          figurine={selectedFigurine}
          isOpen={!!selectedFigurine}
          onClose={() => setSelectedFigurine(null)}
        />
      )}
    </div>
  );
};

export default PublicFigurineGallery;
