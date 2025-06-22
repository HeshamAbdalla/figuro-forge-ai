
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image, 
  Camera, 
  Type, 
  Palette, 
  Images,
  ArrowRight,
  Sparkles
} from "lucide-react";

const StudioHub = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const creationMethods = [
    {
      id: 'image-to-3d',
      title: 'Photo Magic',
      description: "Don't have a photo? Generate one with our Advanced AI and turn it into 3D!",
      icon: Image,
      path: '/studio/image-to-3d',
      color: 'from-blue-400 to-cyan-600',
      popular: true
    },
    {
      id: 'text-to-3d',
      title: 'Dream It, Build It',
      description: 'Describe your wildest ideas and watch them come to life',
      icon: Type,
      path: '/studio/text-to-3d',
      color: 'from-purple-400 to-rose-500',
      new: true
    },
    {
      id: 'camera',
      title: 'Instant 3D Capture',
      description: 'Snap, convert, and create stunning models on the spot',
      icon: Camera,
      path: '/studio/camera',
      color: 'from-green-400 to-teal-600'
    },
    {
      id: 'web-icons',
      title: 'Icon Workshop',
      description: 'Craft beautiful, unique icons that make your projects shine',
      icon: Palette,
      path: '/studio/web-icons',
      color: 'from-orange-400 to-pink-500'
    },
    {
      id: 'gallery',
      title: 'Your Creative Space',
      description: 'Browse, organize, and showcase your amazing creations',
      icon: Images,
      path: '/studio/gallery',
      color: 'from-indigo-400 to-violet-600'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen relative">
        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-12">
              
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Welcome to Your Studio
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
                  Transform your ideas into 3D reality with AI-powered creation tools.
                </p>
                <div className="flex items-center justify-center gap-2 text-figuro-accent">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">Powered by Creative AI</span>
                </div>
              </motion.div>

              {/* Creation Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
                {creationMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card 
                        className="backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/15 hover:border-figuro-accent/40 transition-all duration-300 cursor-pointer group h-full"
                        onClick={() => handleNavigate(method.path)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex flex-col gap-1">
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
                          </div>
                          
                          <CardTitle className="text-white group-hover:text-figuro-accent transition-colors text-lg">
                            {method.title}
                          </CardTitle>
                          <CardDescription className="text-white/70 text-sm">
                            {method.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <Button 
                            className="w-full bg-white/10 border border-white/20 text-white hover:bg-figuro-accent/20 hover:border-figuro-accent transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(method.path);
                            }}
                          >
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Or explore existing creations
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/gallery')}
                    variant="outline"
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/15"
                  >
                    <Images className="w-4 h-4 mr-2" />
                    Browse Gallery
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/profile/figurines')}
                    variant="outline"
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/15"
                  >
                    View My Creations
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </VantaBackground>
      </div>
    </SecurityEnforcedRoute>
  );
};

export default StudioHub;
