
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Box, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import FigurineGallery from "@/components/figurine/FigurineGallery";

const Gallery = () => {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate("/studio");
    toast({
      title: "Create New Model",
      description: "Let's make something awesome!"
    });
  };

  // If still loading authentication, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
            <p className="text-white/70">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If no user after loading, show sign in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70">Please sign in to view your gallery</p>
            <Button 
              onClick={() => navigate("/auth")}
              variant="default"
              className="bg-figuro-accent hover:bg-figuro-accent-hover"
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">Your Gallery</h1>
                <p className="text-white/70">View and manage your 3D models and images with enhanced preview capabilities.</p>
              </div>
              
              <Button 
                onClick={handleCreateNew}
                className="mt-4 md:mt-0 bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                <Box className="w-4 h-4 mr-2" />
                Create New Model
              </Button>
            </div>
            
            {/* Match Studio's gallery layout exactly */}
            <div className="glass-panel rounded-lg">
              <ScrollArea className="h-[600px] w-full">
                <div className="p-6 pr-4">
                  <FigurineGallery />
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
    </div>
  );
};

export default Gallery;
