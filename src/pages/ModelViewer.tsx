
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import VisuallyEnhancedModelDialog from "@/components/gallery/enhanced/VisuallyEnhancedModelDialog";

const ModelViewer: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('ModelViewer: Component mounted', { modelId, searchParams: Object.fromEntries(searchParams) });

  // Extract and validate parameters from URL
  useEffect(() => {
    console.log('ModelViewer: Processing URL parameters...');
    
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'Model';

    console.log('ModelViewer: URL parameters', { url, name });

    if (!url) {
      console.warn('ModelViewer: No model URL provided in search params');
      setError('No model URL provided');
      return;
    }

    try {
      const decodedUrl = decodeURIComponent(url);
      console.log('ModelViewer: Successfully decoded URL', { decodedUrl });
      
      setModelUrl(decodedUrl);
      setFileName(name);
      setIsModalOpen(true);
      setError(null);
    } catch (err) {
      console.error('ModelViewer: Failed to decode model URL:', err);
      setError('Invalid model URL format');
    }
  }, [searchParams]);

  const handleClose = () => {
    console.log('ModelViewer: Closing modal');
    setIsModalOpen(false);
    
    // Navigate back to the return URL or gallery
    const returnUrl = searchParams.get('return') || '/gallery';
    console.log('ModelViewer: Navigating back to', { returnUrl });
    navigate(returnUrl, { replace: true });
  };

  const handleModalOpenChange = (open: boolean) => {
    console.log('ModelViewer: Modal open state changed', { open });
    if (!open) {
      handleClose();
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('ModelViewer: Browser back button pressed');
      event.preventDefault();
      setIsModalOpen(false);
      handleClose();
    };

    if (isModalOpen) {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isModalOpen]);

  // If there's an error, show error state and redirect after a delay
  if (error) {
    console.log('ModelViewer: Showing error state', { error });
    
    // Auto-redirect after showing error
    setTimeout(() => {
      const returnUrl = searchParams.get('return') || '/gallery';
      navigate(returnUrl, { replace: true });
    }, 3000);

    return (
      <PageTransition>
        <Helmet>
          <title>Model Viewer Error - Figuro</title>
        </Helmet>
        <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Model</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <p className="text-white/50 text-sm">Redirecting to gallery in a few seconds...</p>
            <button
              onClick={() => navigate('/gallery')}
              className="mt-4 px-4 py-2 bg-figuro-accent text-white rounded-lg hover:bg-figuro-accent/80 transition-colors"
            >
              Return to Gallery Now
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  console.log('ModelViewer: Rendering dialog', { modelUrl, fileName, isModalOpen });

  return (
    <PageTransition>
      <Helmet>
        <title>{fileName ? `${fileName} - 3D Model Viewer` : '3D Model Viewer'} - Figuro</title>
        <meta name="description" content={`View and interact with 3D model: ${fileName}`} />
        <meta property="og:title" content={`${fileName} - 3D Model Viewer`} />
        <meta property="og:description" content={`Interactive 3D model viewer for ${fileName}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Render the enhanced modal dialog */}
      <VisuallyEnhancedModelDialog
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        modelUrl={modelUrl}
        fileName={fileName}
        onClose={handleClose}
      />
    </PageTransition>
  );
};

export default ModelViewer;
