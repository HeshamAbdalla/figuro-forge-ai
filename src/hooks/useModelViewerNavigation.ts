
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface NavigateToModelViewerParams {
  modelUrl: string;
  fileName?: string;
  modelId?: string;
  autoRotate?: boolean;
  returnUrl?: string;
  useModal?: boolean; // New option for modal vs page navigation
}

export const useModelViewerNavigation = () => {
  const navigate = useNavigate();

  const navigateToModelViewer = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl,
    useModal = false
  }: NavigateToModelViewerParams) => {
    // If useModal is true, return the modal data instead of navigating
    if (useModal) {
      return {
        type: 'modal' as const,
        modelUrl,
        fileName,
        modelId,
        autoRotate,
        returnUrl
      };
    }

    // Create URL parameters for page navigation
    const params = new URLSearchParams();
    params.set('url', encodeURIComponent(modelUrl));
    params.set('name', fileName);
    params.set('autoRotate', autoRotate.toString());
    
    if (returnUrl) {
      params.set('return', returnUrl);
    }

    // Navigate to the dedicated model viewer page
    const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
    navigate(`${modelPath}?${params.toString()}`);
  }, [navigate]);

  const navigateToModelViewerInNewTab = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl
  }: NavigateToModelViewerParams) => {
    // Create URL parameters
    const params = new URLSearchParams();
    params.set('url', encodeURIComponent(modelUrl));
    params.set('name', fileName);
    params.set('autoRotate', autoRotate.toString());
    
    if (returnUrl) {
      params.set('return', returnUrl);
    }

    // Open in new tab
    const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
    const fullUrl = `${window.location.origin}${modelPath}?${params.toString()}`;
    window.open(fullUrl, '_blank');
  }, []);

  return {
    navigateToModelViewer,
    navigateToModelViewerInNewTab
  };
};
