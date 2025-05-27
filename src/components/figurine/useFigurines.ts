
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
        // Don't throw error, just continue with figurines only
      }
      
      console.log('✅ [FIGURINES] Fetched data:', {
        figurines: figurinesData?.length || 0,
        conversions: conversionData?.length || 0
      });
      
      // Process traditional figurines
      const processedFigurines = (figurinesData || []).map(figurine => {
        // Clean image URLs from any cache busting parameters
        let imageUrl = figurine.image_url || "";
        let savedImageUrl = figurine.saved_image_url || null;
        let modelUrl = figurine.model_url || null;
        
        // Helper function to clean URLs
        const cleanUrl = (url: string) => {
          try {
            if (!url) return url;
            const parsedUrl = new URL(url);
            ['t', 'cb', 'cache'].forEach(param => {
              if (parsedUrl.searchParams.has(param)) {
                parsedUrl.searchParams.delete(param);
              }
            });
            return parsedUrl.toString();
          } catch (e) {
            return url;
          }
        };
        
        // Clean all URLs
        if (imageUrl) imageUrl = cleanUrl(imageUrl);
        if (savedImageUrl) savedImageUrl = cleanUrl(savedImageUrl);
        if (modelUrl) modelUrl = cleanUrl(modelUrl);
        
        return {
          id: figurine.id,
          title: figurine.title || "Untitled Figurine",
          prompt: figurine.prompt || "",
          style: figurine.style || "",
          image_url: imageUrl,
          saved_image_url: savedImageUrl,
          model_url: modelUrl,
          created_at: figurine.created_at || new Date().toISOString(),
          user_id: figurine.user_id,
          is_public: figurine.is_public || false
        };
      });
      
      // Process text-to-3D conversions and convert them to Figurine format
      const processedConversions = (conversionData || []).map(conversion => {
        // Use local URLs if available, fallback to original URLs
        const modelUrl = conversion.local_model_url || conversion.model_url || null;
        const thumbnailUrl = conversion.local_thumbnail_url || conversion.thumbnail_url || null;
        
        return {
          id: conversion.id,
          title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated Model'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
          prompt: conversion.prompt || "",
          style: conversion.art_style || "text-to-3d",
          image_url: thumbnailUrl || "", // Use thumbnail as the preview image
          saved_image_url: thumbnailUrl,
          model_url: modelUrl,
          created_at: conversion.created_at || new Date().toISOString(),
          user_id: conversion.user_id,
          is_public: false // Text-to-3D models are private by default
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
          (payload) => {
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
