
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import ModelScene from "@/components/model-viewer/ModelScene";
import LoadingView from "@/components/model-viewer/LoadingView";
import ErrorView from "@/components/model-viewer/ErrorView";
import PageTransition from "@/components/PageTransition";

const ModelViewer: React.FC = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Extract parameters from URL
  useEffect(() => {
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'Model';
    const autoRotateParam = searchParams.get('autoRotate');

    if (url) {
      try {
        const decodedUrl = decodeURIComponent(url);
        setModelUrl(decodedUrl);
        setFileName(name);
        setAutoRotate(autoRotateParam !== 'false');
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

  const handleDownload = () => {
    if (modelUrl) {
      const a = document.createElement('a');
      a.href = modelUrl;
      a.download = fileName || 'model.glb';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your 3D model download has started."
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && modelUrl) {
      try {
        await navigator.share({
          title: `3D Model: ${fileName}`,
          text: `Check out this 3D model: ${fileName}`,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Model viewer link copied to clipboard"
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Model viewer link copied to clipboard"
      });
    }
  };

  const handleModelError = (error: any) => {
    console.error("Model loading error:", error);
    setError(error.message || "Failed to load 3D model");
    setIsLoading(false);
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
        <div className="min-h-screen bg-figuro-dark">
          <Helmet>
            <title>Model Viewer Error - Figuro</title>
          </Helmet>
          
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-6 text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
            
            <ErrorView errorMessage={error} displayModelUrl={modelUrl} />
          </div>
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

      <div className="min-h-screen bg-figuro-dark">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-figuro-dark/90 backdrop-blur-sm border-b border-white/10"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleGoBack}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <div>
                  <h1 className="text-xl font-semibold text-white truncate max-w-md">
                    {fileName}
                  </h1>
                  <p className="text-sm text-white/60">3D Model Viewer</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  title="Model Information"
                >
                  <Info className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  title="Toggle Auto Rotate"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  title="Share Model"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-white/20 text-white hover:bg-white/10"
                  disabled={!modelUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Info Panel */}
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">File Name:</span>
                    <p className="text-white font-medium">{fileName}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Format:</span>
                    <p className="text-white font-medium">GLB (3D Model)</p>
                  </div>
                  <div>
                    <span className="text-white/60">Controls:</span>
                    <p className="text-white font-medium">Click & drag to rotate, scroll to zoom</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* 3D Viewer */}
        <main className="flex-1">
          <div className="h-[calc(100vh-120px)] relative">
            {modelUrl ? (
              <ModelScene
                modelUrl={modelUrl}
                autoRotate={autoRotate}
                onModelError={handleModelError}
                enablePerformanceMonitoring={true}
                isFullscreen={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/70">
                  <p>No model to display</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-figuro-dark/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-sm text-white/60">
              <div className="flex items-center space-x-4">
                <span>Interactive 3D Model Viewer</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Optimized for performance</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Powered by Three.js</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default ModelViewer;
