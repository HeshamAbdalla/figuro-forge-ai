
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Figurine } from '@/types/figurine';
import { useToast } from '@/hooks/use-toast';

export const useFigurines = () => {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFigurines = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setFigurines([]);
        setLoading(false);
        return;
      }
      
      console.log('🔄 [FIGURINES] Fetching figurines and text-to-3D models...');
      
      // Fetch traditional figurines
      const { data: figurinesData, error: figurinesError } = await supabase
        .from('figurines')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
          
      if (figurinesError) throw figurinesError;
      
      // Fetch text-to-3D conversion tasks (completed ones)
      const { data: conversionData, error: conversionError } = await supabase
        .from('conversion_tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'SUCCEEDED')
        .order('created_at', { ascending: false });
      
      if (conversionError) {
        console.warn('Failed to fetch conversion tasks:', conversionError);
      }
      
      console.log('✅ [FIGURINES] Fetched data:', {
        figurines: figurinesData?.length || 0,
        conversions: conversionData?.length || 0
      });
      
      // Helper function to validate and clean URLs
      const validateAndCleanUrl = (url: string | null): string | null => {
        if (!url) return null;
        
        try {
          const parsedUrl = new URL(url);
          
          // Check for expired Meshy.ai URLs
          if (parsedUrl.hostname.includes('meshy.ai') && parsedUrl.searchParams.has('Expires')) {
            const expiresTimestamp = parseInt(parsedUrl.searchParams.get('Expires') || '0');
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (expiresTimestamp < currentTimestamp) {
              console.warn('Expired URL detected:', url);
              return null;
            }
          }
          
          // Remove cache-busting parameters for better caching
          ['t', 'cb', 'cache'].forEach(param => {
            if (parsedUrl.searchParams.has(param)) {
              parsedUrl.searchParams.delete(param);
            }
          });
          
          return parsedUrl.toString();
        } catch (e) {
          console.warn('Invalid URL detected:', url);
          return null;
        }
      };
      
      // Process traditional figurines with better URL handling
      const processedFigurines = (figurinesData || []).map(figurine => {
        const cleanImageUrl = validateAndCleanUrl(figurine.image_url);
        const cleanSavedImageUrl = validateAndCleanUrl(figurine.saved_image_url);
        const cleanModelUrl = validateAndCleanUrl(figurine.model_url);
        
        return {
          id: figurine.id,
          title: figurine.title || "Untitled Figurine",
          prompt: figurine.prompt || "",
          style: figurine.style || "",
          image_url: cleanImageUrl || "",
          saved_image_url: cleanSavedImageUrl,
          model_url: cleanModelUrl,
          created_at: figurine.created_at || new Date().toISOString(),
          user_id: figurine.user_id,
          is_public: figurine.is_public || false
        };
      });
      
      // Process text-to-3D conversions with proper URL priority
      const processedConversions = (conversionData || []).map(conversion => {
        // Prioritize local URLs over remote URLs for better performance and reliability
        const modelUrl = validateAndCleanUrl(conversion.local_model_url) || 
                         validateAndCleanUrl(conversion.model_url);
        const thumbnailUrl = validateAndCleanUrl(conversion.local_thumbnail_url) || 
                            validateAndCleanUrl(conversion.thumbnail_url);
        
        console.log(`Processing conversion ${conversion.id}:`, {
          local_model_url: conversion.local_model_url,
          model_url: conversion.model_url,
          final_model_url: modelUrl,
          local_thumbnail_url: conversion.local_thumbnail_url,
          thumbnail_url: conversion.thumbnail_url,
          final_thumbnail_url: thumbnailUrl
        });
        
        return {
          id: conversion.id,
          title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated Model'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
          prompt: conversion.prompt || "",
          style: conversion.art_style || "text-to-3d",
          image_url: thumbnailUrl || "",
          saved_image_url: thumbnailUrl,
          model_url: modelUrl,
          created_at: conversion.created_at || new Date().toISOString(),
          user_id: conversion.user_id,
          is_public: false
        };
      });
      
      // Combine and sort by creation date
      const allFigurines = [...processedFigurines, ...processedConversions];
      allFigurines.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFigurines(allFigurines);
      setError(null);
      
      console.log(`✅ [FIGURINES] Combined ${allFigurines.length} total items`);
      console.log('Model URLs found:', allFigurines.filter(f => f.model_url).map(f => ({ id: f.id, title: f.title, url: f.model_url })));
    } catch (err: any) {
      console.error('Error fetching figurines:', err);
      setError('Failed to load your figurines');
      toast({
        title: "Error loading figurines",
        description: err.message || "Could not load your figurines",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
    
  useEffect(() => {
    fetchFigurines();
    
    // Subscribe to changes in both tables
    const figurinesSubscription = supabase
      .channel('figurines-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'figurines' }, 
          () => {
            console.log("Figurines table changed, refreshing data");
            fetchFigurines();
          }
      )
      .subscribe();
      
    const conversionsSubscription = supabase
      .channel('conversions-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'conversion_tasks' }, 
          (payload: { new?: any; old?: any; eventType?: string }) => {
            // Only refresh when a task is completed
            if (payload.new && payload.new.status === 'SUCCEEDED') {
              console.log("Text-to-3D conversion completed, refreshing data");
              fetchFigurines();
            }
          }
      )
      .subscribe();
      
    return () => {
      figurinesSubscription.unsubscribe();
      conversionsSubscription.unsubscribe();
    };
  }, [fetchFigurines]);

  return { figurines, loading, error, refreshFigurines: fetchFigurines };
};
