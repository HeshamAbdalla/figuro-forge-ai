
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image, 
  Camera, 
  Type, 
  Palette, 
  Gallery,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";

const StudioHub = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const creationMethods = [
    {
      id: 'image-to-3d',
      title: 'Image to 3D',
      description: 'Transform your images into stunning 3D models',
      icon: Image,
      path: '/studio/image-to-3d',
      color: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      id: 'text-to-3d',
      title: 'Text to 3D',
      description: 'Create 3D models from text descriptions',
      icon: Type,
      path: '/studio/text-to-3d',
      color: 'from-purple-500 to-pink-500',
      new: true
    },
    {
      id: 'camera',
      title: 'Camera Capture',
      description: 'Capture and convert photos directly from your camera',
      icon: Camera,
      path: '/studio/camera',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'web-icons',
      title: 'Web Icons',
      description: 'Generate custom icons for your projects',
      icon: Palette,
      path: '/studio/web-icons',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'gallery',
      title: 'Gallery Studio',
      description: 'Browse and manage your created models',
      icon: Gallery,
      path: '/studio/gallery',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Welcome to Your
                <span className="bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text text-transparent">
                  {" "}Creative Studio
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
                Choose your creation method and bring your ideas to life with AI-powered 3D generation
              </p>
              <div className="flex items-center justify-center gap-2 text-figuro-accent">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Powered by Advanced AI</span>
              </div>
            </motion.div>

            {/* Creation Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {creationMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card 
                      className="bg-figuro-light/5 border-white/10 hover:border-figuro-accent/50 transition-all duration-300 cursor-pointer group h-full"
                      onClick={() => handleNavigate(method.path)}
                    >
                      <CardHeader className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          {method.popular && (
                            <span className="bg-figuro-accent text-white text-xs px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                          {method.new && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-white group-hover:text-figuro-accent transition-colors">
                          {method.title}
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          {method.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full bg-transparent border border-white/20 text-white hover:bg-figuro-accent hover:border-figuro-accent group-hover:scale-105 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(method.path);
                          }}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-16 text-center"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => navigate('/gallery')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Gallery className="w-4 h-4 mr-2" />
                  Browse Public Gallery
                </Button>
                <Button
                  onClick={() => navigate('/profile/figurines')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  My Creations
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SecurityEnforcedRoute>
  );
};

export default StudioHub;
