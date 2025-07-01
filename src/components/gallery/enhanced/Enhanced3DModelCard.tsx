
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${className} cursor-pointer`}
      onClick={handleCardClick}
    >
      <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-white/10 hover:border-figuro-accent/40 transition-all duration-300 overflow-hidden group backdrop-blur-sm h-[400px]">
        {/* Full Height Image Preview */}
        <div className="relative h-full overflow-hidden bg-gray-900/50">
          <img
            src={figurine.image_url}
            alt={figurine.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-model.png';
            }}
          />
          
          {/* Subtle gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          
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

          {/* Like Button with count */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {likeCount > 0 && (
              <span className="text-white/80 text-sm font-medium bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                {likeCount}
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="p-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
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
        </div>
      </Card>
    </motion.div>
  );
};

export default Enhanced3DModelCard;
