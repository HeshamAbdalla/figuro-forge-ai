
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Stars, Zap, Crown, Palette } from "lucide-react";

const StudioHeader = () => {
  // Floating magical elements
  const magicalElements = [
    { icon: Sparkles, delay: 0, x: "15%", y: "20%" },
    { icon: Stars, delay: 0.5, x: "85%", y: "30%" },
    { icon: Wand2, delay: 1, x: "10%", y: "70%" },
    { icon: Zap, delay: 1.5, x: "90%", y: "60%" },
  ];

  const styles = [
    { name: "✨ Isometric Skeuomorphic", featured: true, color: "from-figuro-accent to-purple-500" },
    { name: "🎌 Anime Style", featured: false, color: "from-pink-400 to-rose-500" },
    { name: "🐾 Chibi", featured: false, color: "from-green-400 to-emerald-500" },
    { name: "🔺 Low Poly", featured: false, color: "from-blue-400 to-cyan-500" },
    { name: "🌌 Cyberpunk", featured: false, color: "from-purple-400 to-pink-500" },
    { name: "👑 Realistic", featured: false, color: "from-yellow-400 to-orange-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-center mb-20 relative overflow-hidden"
    >
      {/* Floating magical elements */}
      <div className="absolute inset-0 pointer-events-none">
        {magicalElements.map((element, index) => {
          const IconComponent = element.icon;
          return (
            <motion.div
              key={index}
              className="absolute"
              style={{ left: element.x, top: element.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <IconComponent className="w-6 h-6 text-figuro-accent/40" />
            </motion.div>
          );
        })}
      </div>

      {/* Magical badge */}
      <motion.div 
        className="inline-flex items-center justify-center gap-4 mb-8 px-8 py-4 bg-gradient-to-r from-white/5 via-figuro-accent/10 to-white/5 backdrop-blur-xl rounded-full border border-figuro-accent/30 relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-figuro-accent via-purple-400 to-figuro-accent opacity-30"
          animate={{
            background: [
              "linear-gradient(0deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))",
              "linear-gradient(180deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))",
              "linear-gradient(360deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Crown className="text-figuro-accent w-6 h-6" />
        </motion.div>
        
        <span className="text-transparent bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text font-bold text-lg relative z-10">
          ✨ AI-Powered 3D Magic Studio ✨
        </span>
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wand2 className="text-purple-400 w-6 h-6" />
        </motion.div>
      </motion.div>
      
      {/* Magical title */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-6 relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <span className="text-transparent bg-gradient-to-r from-white via-figuro-accent to-purple-400 bg-clip-text">
          Figuro.AI
        </span>
        <br />
        <motion.span
          className="text-transparent bg-gradient-to-r from-figuro-accent via-purple-400 to-pink-400 bg-clip-text"
          animate={{ 
            backgroundPosition: ['0%', '100%', '0%'] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        >
          ✨ Enchanted Studio ✨
        </motion.span>
      </motion.h1>
      
      {/* Magical description */}
      <motion.p 
        className="text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text font-semibold">
          Unleash your creativity
        </span>{" "}
        and transform imagination into reality. Our magical AI brings your dreams to life with stunning 3D artistry that defies the ordinary.
      </motion.p>
      
      {/* Enhanced style showcase */}
      <motion.div 
        className="relative"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Palette className="w-5 h-5 text-figuro-accent" />
          <span className="text-figuro-accent font-semibold">🎨 Magical Art Styles</span>
          <Palette className="w-5 h-5 text-purple-400" />
        </motion.div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm max-w-4xl mx-auto">
          {styles.map((style, index) => (
            <motion.span
              key={style.name}
              className={`
                px-4 py-2.5 rounded-full font-semibold border transition-all duration-300 cursor-pointer
                ${style.featured 
                  ? `bg-gradient-to-r ${style.color} text-white border-transparent shadow-lg hover:shadow-figuro-accent/25` 
                  : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:border-figuro-accent/40 hover:text-figuro-accent'
                }
              `}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: 1.2 + index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 150 
              }}
              whileHover={{ 
                scale: 1.05,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {style.featured && (
                <motion.span
                  className="inline-block mr-1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐
                </motion.span>
              )}
              {style.name}
              {style.featured && (
                <motion.span
                  className="inline-block ml-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              )}
            </motion.span>
          ))}
        </div>

        {/* Magical sparkle trail */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-figuro-accent rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Corner magical elements */}
      <div className="absolute top-4 right-4">
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
          <Stars className="w-8 h-8 text-figuro-accent/30" />
        </motion.div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <motion.div
          animate={{ 
            rotate: -360,
            y: [0, -8, 0] 
          }}
          transition={{ 
            rotate: { duration: 6, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Sparkles className="w-8 h-8 text-purple-400/30" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudioHeader;
