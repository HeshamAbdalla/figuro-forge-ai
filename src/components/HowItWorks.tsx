
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe Your Vision",
    description: "Simply type what you want to create. From 'a dragon warrior' to 'cute robot companion' - your imagination is the limit.",
    color: "text-blue-400"
  },
  {
    icon: Sparkles,
    title: "AI Creates Magic",
    description: "Our advanced AI transforms your words into stunning 3D models, handling all the complex design work for you.",
    color: "text-figuro-accent"
  },
  {
    icon: Download,
    title: "Get Your Figurine",
    description: "Download your creation instantly or order a physical 3D print. Perfect for gifts, collections, or personal projects.",
    color: "text-green-400"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            How It Works
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            From concept to creation in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0">
                  <motion.div
                    className="h-full bg-figuro-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.3 + 0.5 }}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="glass-panel p-8 text-center relative z-10 h-full">
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 ${step.color}`}>
                    <step.icon size={32} />
                  </div>
                  <div className="text-sm font-medium text-figuro-accent mb-2">
                    Step {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a
            href="/studio"
            className="inline-flex items-center gap-2 bg-figuro-accent hover:bg-figuro-accent-hover text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Creating Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
