import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Images,
  ArrowRight,
  Sparkles,
  Stars,
  Zap,
  Wand2,
  Palette,
  Camera,
  Type,
  Grid3X3
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import SimpleErrorBoundary from "@/components/common/SimpleErrorBoundary";

// Import 3D icon components
import Image3DIcon from "@/components/studio/icons3d/Image3DIcon";
import Text3DIcon from "@/components/studio/icons3d/Text3DIcon";
import Camera3DIcon from "@/components/studio/icons3d/Camera3DIcon";
import Palette3DIcon from "@/components/studio/icons3d/Palette3DIcon";
import Gallery3DIcon from "@/components/studio/icons3d/Gallery3DIcon";

const StudioHub = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles animation
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  const creationMethods = [
    {
      id: 'image-to-3d',
      title: '✨ Photo Magic',
      description: "Transform images into stunning 3D models with AI-powered conversion",
      icon3d: Image3DIcon,
      fallbackIcon: Camera,
      path: '/studio/image-to-3d',
      color: 'from-blue-400 via-cyan-500 to-teal-600',
      glowColor: 'shadow-blue-500/25',
      popular: true,
      magic: "Watch photos come alive in 3D space"
    },
    {
      id: 'text-to-3d',
      title: '🎨 Dream It, Build It',
      description: 'Turn imagination into reality with magical text-to-3D creation',
      icon3d: Text3DIcon,
      fallbackIcon: Type,
      path: '/studio/text-to-3d',
      color: 'from-purple-400 via-pink-500 to-rose-600',
      glowColor: 'shadow-purple-500/25',
      new: true,
      magic: "Words become worlds of possibility"
    },
    {
      id: 'camera',
      title: '📸 Instant 3D Capture',
      description: 'Capture reality and transform it into digital masterpieces',
      icon3d: Camera3DIcon,
      fallbackIcon: Camera,
      path: '/studio/camera',
      color: 'from-green-400 via-emerald-500 to-teal-600',
      glowColor: 'shadow-green-500/25',
      magic: "Reality meets digital artistry"
    },
    {
      id: 'web-icons',
      title: '🎭 Icon Workshop',
      description: 'Craft mesmerizing icons that captivate and inspire',
      icon3d: Palette3DIcon,
      fallbackIcon: Palette,
      path: '/studio/web-icons',
      color: 'from-orange-400 via-red-500 to-pink-600',
      glowColor: 'shadow-orange-500/25',
      magic: "Every pixel tells a story"
    },
    {
      id: 'gallery',
      title: '🏛️ Creative Sanctuary',
      description: 'Your personal realm of artistic achievements and inspiration',
      icon3d: Gallery3DIcon,
      fallbackIcon: Grid3X3,
      path: '/studio/gallery',
      color: 'from-indigo-400 via-purple-500 to-violet-600',
      glowColor: 'shadow-indigo-500/25',
      magic: "Where creativity finds its home"
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-figuro-accent to-purple-400 rounded-full opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Mouse Follower Effect */}
        <motion.div
          className="fixed w-32 h-32 pointer-events-none"
          style={{
            left: mousePosition.x - 64,
            top: mousePosition.y - 64,
            zIndex: 1,
          }}
          animate={{
            scale: hoveredCard ? 1.2 : 0.8,
            opacity: hoveredCard ? 0.6 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-figuro-accent/20 to-purple-400/20 rounded-full blur-2xl" />
        </motion.div>

        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-12">
              
              {/* Magical Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16 relative"
              >
                {/* Floating Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[Wand2, Stars, Zap].map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${20 + index * 30}%`,
                        top: `${10 + index * 15}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                    >
                      <Icon className="w-6 h-6 text-figuro-accent/30" />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-figuro-accent/10 backdrop-blur-xl rounded-full border border-figuro-accent/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-figuro-accent" />
                  </motion.div>
                  <span className="text-transparent bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text font-semibold">
                    ✨ AI-Powered Creative Magic ✨
                  </span>
                </motion.div>

                <motion.h1 
                  className="text-5xl md:text-7xl font-bold mb-6 relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-transparent bg-gradient-to-r from-white via-figuro-accent to-purple-400 bg-clip-text">
                    Welcome to Your
                  </span>
                  <br />
                  <motion.span
                    className="text-transparent bg-gradient-to-r from-figuro-accent via-purple-400 to-pink-400 bg-clip-text"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Magical Studio
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Step into a realm where imagination meets reality. Transform your wildest dreams into stunning 3D masterpieces with the power of AI magic.
                </motion.p>

                <motion.div 
                  className="flex items-center justify-center gap-4 text-figuro-accent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Stars className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-medium">Where Dreams Become Reality</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Wand2 className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Magical Creation Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
                {creationMethods.map((method, index) => {
                  const Icon3DComponent = method.icon3d;
                  const FallbackIcon = method.fallbackIcon;
                  return (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 100 
                      }}
                      whileHover={{ 
                        y: -8, 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      onHoverStart={() => setHoveredCard(method.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <Card 
                        className={`
                          relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 
                          border border-white/20 hover:border-figuro-accent/50 
                          cursor-pointer group h-full overflow-hidden
                          transition-all duration-500 hover:shadow-2xl ${method.glowColor}
                          before:absolute before:inset-0 before:bg-gradient-to-br before:${method.color} before:opacity-0 
                          hover:before:opacity-10 before:transition-opacity before:duration-500
                        `}
                        onClick={() => handleNavigate(method.path)}
                      >
                        {/* Magical border effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-figuro-accent/20 via-purple-400/20 to-figuro-accent/20 opacity-0 group-hover:opacity-100"
                          animate={{
                            background: [
                              "linear-gradient(0deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                              "linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                              "linear-gradient(180deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                              "linear-gradient(270deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                              "linear-gradient(360deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2))",
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />

                        <CardHeader className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <motion.div 
                              className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-black/30 to-black/50 border border-white/20 flex items-center justify-center"
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {/* Floating sparkles around icon */}
                              <AnimatePresence>
                                {hoveredCard === method.id && (
                                  <>
                                    {[...Array(6)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-figuro-accent rounded-full"
                                        initial={{ 
                                          x: 0, 
                                          y: 0, 
                                          opacity: 0,
                                          scale: 0 
                                        }}
                                        animate={{
                                          x: Math.cos((i * Math.PI * 2) / 6) * 30,
                                          y: Math.sin((i * Math.PI * 2) / 6) * 30,
                                          opacity: [0, 1, 0],
                                          scale: [0, 1, 0],
                                        }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{
                                          duration: 1.5,
                                          repeat: Infinity,
                                          delay: i * 0.1,
                                        }}
                                      />
                                    ))}
                                  </>
                                )}
                              </AnimatePresence>

                              <SimpleErrorBoundary fallback={
                                <div className={`w-full h-full bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center`}>
                                  <FallbackIcon className="w-8 h-8 text-white/80" />
                                </div>
                              }>
                                <Suspense fallback={
                                  <div className={`w-full h-full bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center`}>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                      <FallbackIcon className="w-8 h-8 text-white/60" />
                                    </motion.div>
                                  </div>
                                }>
                                  <Icon3DComponent />
                                </Suspense>
                              </SimpleErrorBoundary>
                            </motion.div>
                            
                            <div className="flex flex-col gap-2">
                              {method.popular && (
                                <motion.span 
                                  className="bg-gradient-to-r from-figuro-accent to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  ⭐ Popular
                                </motion.span>
                              )}
                              {method.new && (
                                <motion.span 
                                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg"
                                  animate={{ 
                                    boxShadow: [
                                      "0 0 10px rgba(34, 197, 94, 0.3)",
                                      "0 0 20px rgba(34, 197, 94, 0.6)",
                                      "0 0 10px rgba(34, 197, 94, 0.3)"
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  ✨ New
                                </motion.span>
                              )}
                            </div>
                          </div>
                          
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <CardTitle className="text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-figuro-accent group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 text-xl font-bold">
                              {method.title}
                            </CardTitle>
                            <CardDescription className="text-white/80 text-sm mt-2 leading-relaxed">
                              {method.description}
                            </CardDescription>
                            
                            {/* Magic quote */}
                            <motion.p 
                              className="text-figuro-accent/80 text-xs mt-3 italic font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: hoveredCard === method.id ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              "{method.magic}"
                            </motion.p>
                          </motion.div>
                        </CardHeader>
                        
                        <CardContent className="relative z-10 pt-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              className={`
                                w-full bg-gradient-to-r ${method.color} border-0 text-white font-semibold
                                hover:shadow-lg hover:shadow-figuro-accent/25 transition-all duration-300
                                relative overflow-hidden group/btn
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(method.path);
                              }}
                            >
                              {/* Button shimmer effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                initial={{ x: "-100%" }}
                                animate={{ x: hoveredCard === method.id ? "100%" : "-100%" }}
                                transition={{ duration: 0.6 }}
                              />
                              
                              <span className="relative z-10">Enter the Magic</span>
                              <motion.div
                                animate={{ x: hoveredCard === method.id ? 5 : 0 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className="relative z-10"
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

              {/* Magical Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-center relative"
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-figuro-accent/10 to-pink-500/10 rounded-3xl blur-xl" />
                
                <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
                  <motion.h3 
                    className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text mb-6"
                    animate={{ 
                      backgroundPosition: ['0%', '100%', '0%'] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    ✨ Discover Magical Creations ✨
                  </motion.h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => navigate('/gallery')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <Images className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Browse Gallery</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => navigate('/profile/figurines')}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <Stars className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">My Creations</span>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Floating elements around the section */}
                  <div className="absolute -top-6 -left-6">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1] 
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Sparkles className="w-8 h-8 text-figuro-accent/50" />
                    </motion.div>
                  </div>
                  
                  <div className="absolute -bottom-6 -right-6">
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        y: [0, -10, 0] 
                      }}
                      transition={{ 
                        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Stars className="w-8 h-8 text-purple-400/50" />
                    </motion.div>
                  </div>
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
