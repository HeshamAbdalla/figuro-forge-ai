
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Figurine } from '@/types/figurine';
import { useToast } from '@/hooks/use-toast';
import { validateAndCleanUrl, prioritizeUrls } from '@/utils/urlValidationUtils';

export const usePublicFigurines = () => {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPublicFigurines = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔄 [PUBLIC-FIGURINES] Fetching public figurines and text-to-3D models...');
      
      // Fetch public traditional figurines
      const { data: figurinesData, error: figurinesError } = await supabase
        .from('figurines')
        .select(`
          *,
          profiles!inner(
            display_name,
            full_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
          
      if (figurinesError) throw figurinesError;
      
      // Fetch public text-to-3D conversion tasks (completed ones)
      const { data: conversionData, error: conversionError } = await supabase
        .from('conversion_tasks')
        .select(`
          *,
          profiles!inner(
            display_name,
            full_name
          )
        `)
        .eq('status', 'SUCCEEDED')
        .not('local_model_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (conversionError) {
        console.warn('Failed to fetch conversion tasks:', conversionError);
      }
      
      console.log('✅ [PUBLIC-FIGURINES] Fetched data:', {
        figurines: figurinesData?.length || 0,
        conversions: conversionData?.length || 0
      });
      
      // Process traditional figurines with enhanced URL validation
      const processedFigurines = (figurinesData || []).map(figurine => {
        const imageValidation = validateAndCleanUrl(figurine.image_url);
        const savedImageValidation = validateAndCleanUrl(figurine.saved_image_url);
        const modelValidation = validateAndCleanUrl(figurine.model_url);
        
        // Get user display name
        const profile = figurine.profiles as any;
        const userName = profile?.display_name || profile?.full_name || 'Anonymous';
        
        // Safely handle metadata object
        const existingMetadata = figurine.metadata && typeof figurine.metadata === 'object' ? figurine.metadata : {};
        
        return {
          id: figurine.id,
          title: figurine.title || "Untitled Figurine",
          prompt: figurine.prompt || "",
          style: figurine.style || "",
          image_url: imageValidation.isValid ? imageValidation.cleanUrl : (figurine.image_url || ""),
          saved_image_url: savedImageValidation.isValid ? savedImageValidation.cleanUrl : figurine.saved_image_url,
          model_url: modelValidation.isValid ? modelValidation.cleanUrl : figurine.model_url,
          created_at: figurine.created_at || new Date().toISOString(),
          user_id: figurine.user_id,
          is_public: figurine.is_public || false,
          metadata: {
            ...existingMetadata,
            creator_name: userName
          }
        };
      });
      
      // Process text-to-3D conversions with enhanced URL prioritization and validation
      const processedConversions = (conversionData || []).map(conversion => {
        // Enhanced URL prioritization: local URLs first, then validate
        const prioritizedModelUrl = prioritizeUrls([
          conversion.local_model_url,
          conversion.model_url
        ]);
        
        const prioritizedThumbnailUrl = prioritizeUrls([
          conversion.local_thumbnail_url,
          conversion.thumbnail_url
        ]);
        
        // Get user display name
        const profile = conversion.profiles as any;
        const userName = profile?.display_name || profile?.full_name || 'Anonymous';
        
        return {
          id: conversion.id,
          title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated Model'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
          prompt: conversion.prompt || "",
          style: conversion.art_style || "text-to-3d",
          image_url: prioritizedThumbnailUrl || "",
          saved_image_url: prioritizedThumbnailUrl,
          model_url: prioritizedModelUrl,
          created_at: conversion.created_at || new Date().toISOString(),
          user_id: conversion.user_id,
          is_public: true, // Text-to-3D models are considered public for community gallery
          metadata: {
            creator_name: userName,
            conversion_type: 'text-to-3d'
          }
        };
      });
      
      // Combine and sort by creation date
      const allFigurines = [...processedFigurines, ...processedConversions];
      allFigurines.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFigurines(allFigurines);
      setError(null);
      
      console.log(`✅ [PUBLIC-FIGURINES] Combined ${allFigurines.length} total public items`);
      
    } catch (err: any) {
      console.error('Error fetching public figurines:', err);
      setError('Failed to load public figurines');
      toast({
        title: "Error loading public gallery",
        description: err.message || "Could not load the community gallery",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
    
  useEffect(() => {
    fetchPublicFigurines();
    
    // Subscribe to changes in both tables for real-time updates
    const figurinesSubscription = supabase
      .channel('public-figurines-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'figurines' }, 
          (payload: { new?: any; old?: any; eventType?: string }) => {
            // Only refresh if a public figurine is added/updated
            if (payload.new && payload.new.is_public) {
              console.log("Public figurine changed, refreshing data");
              fetchPublicFigurines();
            }
          }
      )
      .subscribe();
      
    const conversionsSubscription = supabase
      .channel('public-conversions-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'conversion_tasks' }, 
          (payload: { new?: any; old?: any; eventType?: string }) => {
            // Only refresh when a task is completed with a model
            if (payload.new && payload.new.status === 'SUCCEEDED' && payload.new.local_model_url) {
              console.log("Public text-to-3D conversion completed, refreshing data");
              fetchPublicFigurines();
            }
          }
      )
      .subscribe();
      
    return () => {
      figurinesSubscription.unsubscribe();
      conversionsSubscription.unsubscribe();
    };
  }, [fetchPublicFigurines]);

  return { figurines, loading, error, refreshFigurines: fetchPublicFigurines };
};
