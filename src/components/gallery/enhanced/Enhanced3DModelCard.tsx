
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Download, Eye, Share2, Box, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Figurine } from "@/types/figurine";

interface Enhanced3DModelCardProps {
  figurine: Figurine;
  onView: (figurine: Figurine) => void;
  onDownload: (figurine: Figurine) => void;
  onShare?: (figurine: Figurine) => void;
  className?: string;
}

const Enhanced3DModelCard: React.FC<Enhanced3DModelCardProps> = ({
  figurine,
  onView,
  onDownload,
  onShare,
  className = ""
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(figurine.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    checkIfLiked();
  }, [figurine.id]);

  const checkIfLiked = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('figurine_likes')
        .select('id')
        .eq('figurine_id', figurine.id)
        .eq('user_id', session.user.id)
        .single();

      if (!error && data) {
        setIsLiked(true);
      }
    } catch (error) {
      // User hasn't liked this figurine
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsLiking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to like models",
          variant: "destructive"
        });
        return;
      }

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('figurine_likes')
          .delete()
          .eq('figurine_id', figurine.id)
          .eq('user_id', session.user.id);

        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await supabase
          .from('figurine_likes')
          .insert({
            figurine_id: figurine.id,
            user_id: session.user.id
          });

        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const creatorName = figurine.metadata?.creator_name || 'Anonymous';
  const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-white/10 hover:border-figuro-accent/40 transition-all duration-300 overflow-hidden group backdrop-blur-sm">
        {/* Image Preview */}
        <div className="relative aspect-square overflow-hidden bg-gray-900/50">
          <img
            src={figurine.image_url}
            alt={figurine.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-model.png';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="sm"
              onClick={() => onView(figurine)}
              className="bg-figuro-accent/90 hover:bg-figuro-accent text-white border-none shadow-lg"
            >
              <Eye className="w-4 h-4 mr-1" />
              View 3D
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(figurine)}
              className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isTextTo3D && (
              <Badge className="bg-figuro-accent/90 text-white text-xs">
                <Box className="w-3 h-3 mr-1" />
                Text-to-3D
              </Badge>
            )}
            {figurine.model_url && (
              <Badge className="bg-green-500/90 text-white text-xs">
                3D Model
              </Badge>
            )}
          </div>

          {/* Like Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-400'
              }`} 
            />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-figuro-accent transition-colors">
            {figurine.title}
          </h3>
          
          {/* Creator */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <User className="w-3 h-3" />
            <span>by {creatorName}</span>
          </div>
          
          {/* Prompt preview */}
          {figurine.prompt && (
            <p className="text-white/70 text-sm line-clamp-2">
              {figurine.prompt}
            </p>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {figurine.metadata?.view_count || 0}
              </span>
            </div>
            
            {onShare && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onShare(figurine)}
                className="text-white/60 hover:text-white p-1"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Enhanced3DModelCard;
