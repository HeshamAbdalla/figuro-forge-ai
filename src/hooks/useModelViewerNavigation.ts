
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface NavigateToModelViewerParams {
  modelUrl: string;
  fileName?: string;
  modelId?: string;
  autoRotate?: boolean;
  returnUrl?: string;
  useModal?: boolean; // This option is now the default behavior
}

export const useModelViewerNavigation = () => {
  const navigate = useNavigate();

  const navigateToModelViewer = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl,
    useModal = true // Default to modal behavior
  }: NavigateToModelViewerParams) => {
    console.log('useModelViewerNavigation: Navigating to model viewer', {
      modelUrl,
      fileName,
      modelId,
      autoRotate,
      returnUrl,
      useModal
    });

    // Validate model URL before navigation
    if (!modelUrl || typeof modelUrl !== 'string') {
      console.error('useModelViewerNavigation: Invalid model URL provided', { modelUrl });
      return;
    }

    // Create URL parameters for modal navigation
    const params = new URLSearchParams();
    
    try {
      params.set('url', encodeURIComponent(modelUrl));
      params.set('name', fileName);
      params.set('autoRotate', autoRotate.toString());
      
      if (returnUrl) {
        params.set('return', returnUrl);
      } else {
        // Set current location as return URL
        params.set('return', window.location.pathname);
      }

      // Navigate to the model viewer page which will show as a modal
      const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
      const fullPath = `${modelPath}?${params.toString()}`;
      
      console.log('useModelViewerNavigation: Navigating to path', { fullPath });
      navigate(fullPath);
    } catch (error) {
      console.error('useModelViewerNavigation: Error during navigation', error);
    }
  }, [navigate]);

  const navigateToModelViewerInNewTab = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl
  }: NavigateToModelViewerParams) => {
    console.log('useModelViewerNavigation: Opening model viewer in new tab', {
      modelUrl,
      fileName,
      modelId,
      autoRotate,
      returnUrl
    });

    // Validate model URL before navigation
    if (!modelUrl || typeof modelUrl !== 'string') {
      console.error('useModelViewerNavigation: Invalid model URL provided for new tab', { modelUrl });
      return;
    }

    // Create URL parameters
    const params = new URLSearchParams();
    
    try {
      params.set('url', encodeURIComponent(modelUrl));
      params.set('name', fileName);
      params.set('autoRotate', autoRotate.toString());
      
      if (returnUrl) {
        params.set('return', returnUrl);
      }

      // Open in new tab
      const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
      const fullUrl = `${window.location.origin}${modelPath}?${params.toString()}`;
      
      console.log('useModelViewerNavigation: Opening URL in new tab', { fullUrl });
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('useModelViewerNavigation: Error opening new tab', error);
    }
  }, []);

  return {
    navigateToModelViewer,
    navigateToModelViewerInNewTab
  };
};
