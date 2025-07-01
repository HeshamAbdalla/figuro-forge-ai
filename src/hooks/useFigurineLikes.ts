
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFigurineLikes = (figurineId: string, initialLikeCount: number = 0) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkIfLiked();
  }, [figurineId]);

  const checkIfLiked = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('figurine_likes')
        .select('id')
        .eq('figurine_id', figurineId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to like models",
          variant: "destructive"
        });
        return false;
      }

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('figurine_likes')
          .delete()
          .eq('figurine_id', figurineId)
          .eq('user_id', session.user.id);

        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
          return true;
        }
      } else {
        // Like
        const { error } = await supabase
          .from('figurine_likes')
          .insert({
            figurine_id: figurineId,
            user_id: session.user.id
          });

        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
    isLoading
  };
};
