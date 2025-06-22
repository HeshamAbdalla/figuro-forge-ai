
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
  Sparkles,
  Zap,
  Heart,
  Coffee,
  Lightbulb,
  Rocket
} from "lucide-react";

const StudioHub = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const creationMethods = [
    {
      id: 'image-to-3d',
      title: 'Photo Magic ✨',
      description: 'Turn your favorite photos into incredible 3D masterpieces',
      longDescription: 'Got a cool photo? Let\'s make it pop in 3D!',
      icon: Image,
      path: '/studio/image-to-3d',
      color: 'from-blue-400 via-blue-500 to-cyan-600',
      popular: true,
      emoji: '📸'
    },
    {
      id: 'text-to-3d',
      title: 'Dream It, Build It',
      description: 'Describe your wildest ideas and watch them come to life',
      longDescription: 'Your imagination is the only limit here',
      icon: Type,
      path: '/studio/text-to-3d',
      color: 'from-purple-400 via-pink-500 to-rose-500',
      new: true,
      emoji: '💭'
    },
    {
      id: 'camera',
      title: 'Instant 3D Capture',
      description: 'Snap, convert, and create stunning models on the spot',
      longDescription: 'Real-time magic at your fingertips',
      icon: Camera,
      path: '/studio/camera',
      color: 'from-green-400 via-emerald-500 to-teal-600',
      emoji: '📷'
    },
    {
      id: 'web-icons',
      title: 'Icon Workshop',
      description: 'Craft beautiful, unique icons that make your projects shine',
      longDescription: 'Because every project deserves beautiful icons',
      icon: Palette,
      path: '/studio/web-icons',
      color: 'from-orange-400 via-red-500 to-pink-500',
      emoji: '🎨'
    },
    {
      id: 'gallery',
      title: 'Your Creative Space',
      description: 'Browse, organize, and showcase your amazing creations',
      longDescription: 'Your personal gallery of awesomeness',
      icon: Images,
      path: '/studio/gallery',
      color: 'from-indigo-400 via-purple-500 to-violet-600',
      emoji: '🖼️'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Floating elements animation
  const floatingElements = [
    { icon: Sparkles, delay: 0, x: 20, y: 10 },
    { icon: Heart, delay: 2, x: -30, y: -20 },
    { icon: Lightbulb, delay: 4, x: 40, y: 30 },
    { icon: Coffee, delay: 6, x: -20, y: 40 },
  ];

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen relative overflow-hidden">
        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-12 relative z-10">
              {/* Floating Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {floatingElements.map((element, index) => {
                  const IconComponent = element.icon;
                  return (
                    <motion.div
                      key={index}
                      className="absolute opacity-20"
                      style={{
                        left: `${20 + element.x}%`,
                        top: `${30 + element.y}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        delay: element.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <IconComponent className="w-8 h-8 text-figuro-accent" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16 relative"
              >
                <motion.div
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-figuro-accent/5 to-transparent"
                />
                
                <div className="relative">
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold text-white mb-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Hey there, Creator! 👋
                    <br />
                    <span className="bg-gradient-to-r from-figuro-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Ready to Build Something Amazing?
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome to your personal creative playground! Whether you're turning photos into 3D magic, 
                    bringing wild ideas to life, or crafting the perfect icon – we've got the tools to make it happen. 
                    <span className="text-figuro-accent font-medium"> Let's create something incredible together! </span>
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center justify-center gap-3 text-figuro-accent mb-4"
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Rocket className="w-5 h-5" />
                    <span className="text-sm font-medium">Powered by Creative AI Magic</span>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Creation Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {creationMethods.map((method, index) => {
                  const IconComponent = method.icon;
                  return (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 30, rotateX: -15 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.15,
                        type: "spring", 
                        stiffness: 100 
                      }}
                      whileHover={{ 
                        y: -8, 
                        rotateY: 5,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Card 
                        className="backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/20 hover:bg-gradient-to-br hover:from-white/25 hover:via-white/15 hover:to-white/10 hover:border-figuro-accent/40 transition-all duration-700 cursor-pointer group h-full shadow-xl hover:shadow-2xl hover:shadow-figuro-accent/30 relative overflow-hidden"
                        onClick={() => handleNavigate(method.path)}
                      >
                        {/* Animated background gradient */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        
                        <CardHeader className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <motion.div 
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg relative overflow-hidden`}
                              whileHover={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.6 }}
                            >
                              <IconComponent className="w-7 h-7 text-white" />
                              <motion.div
                                className="absolute inset-0 bg-white/20"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                              />
                            </motion.div>
                            
                            <div className="flex flex-col items-center gap-1">
                              {method.popular && (
                                <motion.span 
                                  className="bg-gradient-to-r from-figuro-accent to-purple-500 text-white text-xs px-3 py-1 rounded-full border border-white/30 shadow-lg"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  🔥 Popular
                                </motion.span>
                              )}
                              {method.new && (
                                <motion.span 
                                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full border border-white/30 shadow-lg"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                >
                                  ✨ New
                                </motion.span>
                              )}
                              <span className="text-2xl">{method.emoji}</span>
                            </div>
                          </div>
                          
                          <CardTitle className="text-white group-hover:text-figuro-accent transition-colors text-xl font-bold mb-2">
                            {method.title}
                          </CardTitle>
                          <CardDescription className="text-white/80 text-sm leading-relaxed mb-2">
                            {method.description}
                          </CardDescription>
                          <p className="text-figuro-accent/80 text-xs italic">
                            {method.longDescription}
                          </p>
                        </CardHeader>
                        
                        <CardContent className="relative z-10">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              className="w-full bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-sm border border-white/30 text-white hover:from-figuro-accent/30 hover:to-purple-500/30 hover:border-figuro-accent/60 hover:shadow-xl hover:shadow-figuro-accent/25 group-hover:scale-105 transition-all duration-500 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(method.path);
                              }}
                            >
                              <span>Let's Create</span>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </motion.div>
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions with personality */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-20 text-center"
              >
                <motion.h3 
                  className="text-2xl font-bold text-white mb-4"
                  animate={{ 
                    backgroundPosition: ["0%", "100%", "0%"] 
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity 
                  }}
                >
                  Or maybe you want to... 🤔
                </motion.h3>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate('/gallery')}
                      variant="outline"
                      className="backdrop-blur-xl bg-gradient-to-r from-white/15 to-white/10 border border-white/30 text-white hover:from-white/25 hover:to-white/15 hover:border-figuro-accent/60 hover:shadow-xl hover:shadow-figuro-accent/25 transition-all duration-500 px-6 py-3"
                    >
                      <Images className="w-5 h-5 mr-2" />
                      Explore Amazing Creations 🌟
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate('/profile/figurines')}
                      variant="outline"
                      className="backdrop-blur-xl bg-gradient-to-r from-white/15 to-white/10 border border-white/30 text-white hover:from-white/25 hover:to-white/15 hover:border-figuro-accent/60 hover:shadow-xl hover:shadow-figuro-accent/25 transition-all duration-500 px-6 py-3"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      See Your Masterpieces 💎
                    </Button>
                  </motion.div>
                </div>
                
                <motion.p 
                  className="text-white/60 text-sm mt-6 max-w-md mx-auto italic"
                  animate={{ opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  "Every great creation starts with a single click. What will you build today?" ✨
                </motion.p>
              </motion.div>
            </div>
          </div>
        </VantaBackground>
      </div>
    </SecurityEnforcedRoute>
  );
};

export default StudioHub;
