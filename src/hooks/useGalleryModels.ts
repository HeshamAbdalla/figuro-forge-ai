import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryModel {
  id: string;
  title: string | null;
  model_url: string | null;
  image_url: string | null;
  prompt: string;
}

export const useGalleryModels = (limit: number = 5) => {
  const [models, setModels] = useState<GalleryModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryModels = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('figurines')
          .select('id, title, model_url, image_url, prompt')
          .eq('is_public', true)
          .not('model_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching gallery models:', error);
          return;
        }

        setModels(data || []);
      } catch (error) {
        console.error('Error in fetchGalleryModels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryModels();
  }, [limit]);

  return { models, loading };
};