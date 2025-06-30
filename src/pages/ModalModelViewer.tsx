
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import VisuallyEnhancedModelDialog from "@/components/gallery/enhanced/VisuallyEnhancedModelDialog";

const ModalModelViewer: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract parameters from URL
  useEffect(() => {
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'Model';

    if (url) {
      try {
        const decodedUrl = decodeURIComponent(url);
        setModelUrl(decodedUrl);
        setFileName(name);
        setIsModalOpen(true);
      } catch (err) {
        console.error('Failed to decode model URL:', err);
        handleClose();
      }
    } else {
      handleClose();
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsModalOpen(false);
    
    // Navigate back to the return URL or gallery
    const returnUrl = searchParams.get('return') || '/gallery';
    navigate(returnUrl, { replace: true });
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setIsModalOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PageTransition>
      <Helmet>
        <title>{fileName ? `${fileName} - 3D Model Viewer` : '3D Model Viewer'} - Figuro</title>
        <meta name="description" content={`View and interact with 3D model: ${fileName}`} />
        <meta property="og:title" content={`${fileName} - 3D Model Viewer`} />
        <meta property="og:description" content={`Interactive 3D model viewer for ${fileName}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

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

export default ModalModelViewer;
