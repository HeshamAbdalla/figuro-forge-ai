
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Figurine } from '@/types/figurine';
import { useToast } from '@/hooks/use-toast';
import { validateAndCleanUrl, prioritizeUrlsWithInfo } from '@/utils/urlValidationUtils';
import { useSecureQuery } from '@/hooks/useSecureQuery';

export const usePublicFigurines = () => {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use secure query for fetching public figurines
  const { data: publicData, isLoading, error: queryError, refetch } = useSecureQuery({
    queryKey: ['public-figurines'],
    queryFn: async () => {
      console.log('🔄 [PUBLIC-FIGURINES] Fetching public figurines and text-to-3D models...');
      
      // Fetch public traditional figurines (simplified query without joins)
      const { data: figurinesData, error: figurinesError } = await supabase
        .from('figurines')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
          
      if (figurinesError) throw figurinesError;
      
      // Fetch public text-to-3D conversion tasks (completed ones, simplified query)
      const { data: conversionData, error: conversionError } = await supabase
        .from('conversion_tasks')
        .select('*')
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
      
      return { figurinesData, conversionData };
    },
    requireAuth: false, // Public data doesn't require auth
    tableName: 'figurines'
  });

  useEffect(() => {
    if (publicData) {
      const { figurinesData, conversionData } = publicData;
      
      // Process traditional figurines with enhanced URL validation
      const processedFigurines = (figurinesData || []).map(figurine => {
        const imageValidation = validateAndCleanUrl(figurine.image_url);
        const savedImageValidation = validateAndCleanUrl(figurine.saved_image_url);
        const modelValidation = validateAndCleanUrl(figurine.model_url);
        
        // Valid art styles from the Figurine type
        const validStyles: Figurine['style'][] = ['isometric', 'anime', 'pixar', 'steampunk', 'lowpoly', 'cyberpunk', 'realistic', 'chibi', 'text-to-3d'];
        const validStyle = validStyles.includes(figurine.style as Figurine['style']) 
          ? figurine.style as Figurine['style']
          : 'isometric' as const;
        
        // Safely handle metadata object
        const existingMetadata = figurine.metadata && typeof figurine.metadata === 'object' ? figurine.metadata : {};
        
        return {
          id: figurine.id,
          title: figurine.title || "Untitled Figurine",
          prompt: figurine.prompt || "",
          style: validStyle,
          image_url: imageValidation.isValid ? imageValidation.cleanUrl : (figurine.image_url || ""),
          saved_image_url: savedImageValidation.isValid ? savedImageValidation.cleanUrl : figurine.saved_image_url,
          model_url: modelValidation.isValid ? modelValidation.cleanUrl : figurine.model_url,
          created_at: figurine.created_at || new Date().toISOString(),
          user_id: figurine.user_id,
          is_public: figurine.is_public || false,
          file_type: 'image' as const,
          metadata: {
            ...existingMetadata,
            creator_name: 'Community Member' // Default name since we can't join with profiles
          }
        };
      });
      
      // Process text-to-3D conversions with enhanced URL prioritization and validation
      const processedConversions = (conversionData || []).map(conversion => {
        // Enhanced URL prioritization: local URLs first, then validate
        const modelUrls = [
          conversion.local_model_url,
          conversion.model_url
        ].filter(Boolean);
        
        const thumbnailUrls = [
          conversion.local_thumbnail_url,
          conversion.thumbnail_url
        ].filter(Boolean);
        
        const modelPrioritization = prioritizeUrlsWithInfo(modelUrls);
        const thumbnailPrioritization = prioritizeUrlsWithInfo(thumbnailUrls);
        
        console.log('🔍 [PUBLIC-FIGURINES] URL prioritization for conversion:', conversion.id, {
          modelUrls: modelUrls.length,
          selectedModel: modelPrioritization.url ? 'Found' : 'None',
          isExpired: modelPrioritization.info?.isExpired || false,
          thumbnailUrls: thumbnailUrls.length,
          selectedThumbnail: thumbnailPrioritization.url ? 'Found' : 'None'
        });
        
        // Valid art styles from the Figurine type
        const validStyles: Figurine['style'][] = ['isometric', 'anime', 'pixar', 'steampunk', 'lowpoly', 'cyberpunk', 'realistic', 'chibi', 'text-to-3d'];
        const validStyle = validStyles.includes(conversion.art_style as Figurine['style'])
          ? conversion.art_style as Figurine['style']
          : 'text-to-3d' as const;
        
        return {
          id: conversion.id,
          title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated Model'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
          prompt: conversion.prompt || "",
          style: validStyle,
          image_url: thumbnailPrioritization.url || "",
          saved_image_url: thumbnailPrioritization.url,
          model_url: modelPrioritization.url,
          created_at: conversion.created_at || new Date().toISOString(),
          user_id: conversion.user_id,
          is_public: true,
          file_type: '3d-model' as const,
          metadata: {
            creator_name: 'Community Member', // Default name since we can't join with profiles
            conversion_type: 'text-to-3d',
            url_info: modelPrioritization.info, // Add URL info for better error handling
            fallback_urls: modelUrls // Keep all URLs for fallback
          }
        };
      });
      
      // Filter out conversions without valid model URLs for 3D preview
      const validConversions = processedConversions.filter(conversion => {
        const hasValidModel = conversion.model_url && conversion.model_url.trim() !== '';
        if (!hasValidModel) {
          console.warn('⚠️ [PUBLIC-FIGURINES] Skipping conversion without valid model URL:', conversion.id);
        }
        return hasValidModel;
      });
      
      // Combine and sort by creation date
      const allFigurines = [...processedFigurines, ...validConversions];
      allFigurines.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setFigurines(allFigurines);
      setLoading(false);
      setError(null);
      
      console.log('✅ [PUBLIC-FIGURINES] Processing completed:', {
        totalFigurines: allFigurines.length,
        traditional: processedFigurines.length,
        textTo3D: validConversions.length,
        filteredOut: processedConversions.length - validConversions.length
      });
    }
  }, [publicData]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (queryError) {
      console.error('❌ [PUBLIC-FIGURINES] Query error:', queryError);
      setError(queryError.message);
      toast({
        title: "Error loading figurines",
        description: "Failed to load public figurines. Please try again later.",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  const refetchFigurines = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    figurines,
    loading,
    error,
    refetch: refetchFigurines
  };
};
