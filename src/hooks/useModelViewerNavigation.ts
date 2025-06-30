
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface NavigateToModelViewerParams {
  modelUrl: string;
  fileName?: string;
  modelId?: string;
  autoRotate?: boolean;
  returnUrl?: string;
}

export const useModelViewerNavigation = () => {
  const navigate = useNavigate();

  const navigateToModelViewer = useCallback(({
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
