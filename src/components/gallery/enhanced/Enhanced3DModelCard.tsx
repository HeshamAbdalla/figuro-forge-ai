
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlareCard } from "@/components/ui/glare-card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Figurine } from "@/types/figurine";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

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
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/model/${figurine.id}`);
  };

  const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
  const { isMobile, isTablet } = useResponsiveLayout();

  // Responsive sizing for GlareCard
  const cardStyle = {
    "--radius": "16px",
    width: isMobile ? "280px" : isTablet ? "300px" : "320px",
    aspectRatio: isMobile ? "3/4" : "17/21",
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      className={`${className} cursor-pointer group`}
      onClick={handleCardClick}
      style={cardStyle}
    >
      <GlareCard className="relative overflow-hidden">
        {/* Full Height Image Preview */}
        <div className="relative h-full w-full">
          <img
            src={figurine.image_url}
            alt={figurine.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-model.png';
            }}
          />
          
          {/* Enhanced gradient overlay for holographic effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {isTextTo3D && (
              <Badge className="bg-figuro-accent/90 backdrop-blur-sm text-white text-xs border border-white/20">
                <Box className="w-3 h-3 mr-1" />
                Text-to-3D
              </Badge>
            )}
            {figurine.model_url && (
              <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs border border-white/20">
                3D Model
              </Badge>
            )}
          </div>

          {/* Like Button with enhanced styling */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {likeCount > 0 && (
              <span className="text-white/90 text-sm font-semibold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                {likeCount}
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="p-2 bg-black/50 hover:bg-red-500/20 text-white backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-red-400/50"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-300 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-white hover:text-red-400 hover:scale-110'
                }`} 
              />
            </Button>
          </div>

          {/* Bottom info overlay with holographic styling */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-sm">
            <h3 className="text-white font-semibold text-sm mb-1 truncate">
              {figurine.title}
            </h3>
            {figurine.metadata?.creator_name && (
              <p className="text-white/70 text-xs truncate">
                by {figurine.metadata.creator_name}
              </p>
            )}
          </div>
        </div>
      </GlareCard>
    </motion.div>
  );
};

export default Enhanced3DModelCard;
