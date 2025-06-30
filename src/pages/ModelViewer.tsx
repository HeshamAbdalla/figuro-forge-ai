
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import PageLevelModelViewer from "@/components/model-viewer/PageLevelModelViewer";
import LoadingView from "@/components/model-viewer/LoadingView";
import ErrorView from "@/components/model-viewer/ErrorView";

const ModelViewer: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract parameters from URL
  useEffect(() => {
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'Model';

    if (url) {
      try {
        const decodedUrl = decodeURIComponent(url);
        setModelUrl(decodedUrl);
        setFileName(name);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to decode model URL:', err);
        setError('Invalid model URL');
        setIsLoading(false);
      }
    } else {
      setError('No model URL provided');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleGoBack = () => {
    const returnUrl = searchParams.get('return') || '/gallery';
    navigate(returnUrl);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
          <LoadingView progress={0} />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
          <Helmet>
            <title>Model Viewer Error - Figuro</title>
          </Helmet>
          <ErrorView errorMessage={error} displayModelUrl={modelUrl} />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{fileName ? `${fileName} - 3D Model Viewer` : '3D Model Viewer'} - Figuro</title>
        <meta name="description" content={`View and interact with 3D model: ${fileName}`} />
        <meta property="og:title" content={`${fileName} - 3D Model Viewer`} />
        <meta property="og:description" content={`Interactive 3D model viewer for ${fileName}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <PageLevelModelViewer
        modelUrl={modelUrl}
        fileName={fileName}
        onBack={handleGoBack}
      />
    </PageTransition>
  );
};

export default ModelViewer;
