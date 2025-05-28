
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Introduction = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Transform simple text descriptions into detailed 3D figurines using cutting-edge artificial intelligence."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate high-quality 3D models in under 2 minutes, streamlining your creative workflow."
    },
    {
      icon: Shield,
      title: "Commercial Rights",
      description: "Own your creations with full commercial licensing on Pro and Enterprise plans."
    },
    {
      icon: Globe,
      title: "Multiple Formats",
      description: "Download in STL, OBJ, and GLB formats compatible with all major 3D printing services."
    }
  ];

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs" className="text-white/70 hover:text-white">Documentation</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-figuro-accent">Introduction to Figuro.AI</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Introduction to Figuro.AI</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Welcome to Figuro.AI, the revolutionary platform that transforms your imagination into tangible 3D figurines. 
              Whether you're a game developer, hobbyist, educator, or creative professional, our AI-powered platform makes 
              3D model creation accessible to everyone.
            </p>
          </motion.div>

          {/* What is Figuro.AI Section */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">What is Figuro.AI?</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <p className="text-white/80 leading-relaxed mb-4">
                Figuro.AI is an innovative web application that leverages advanced artificial intelligence to generate 
                custom 3D figurines from simple text descriptions. Our platform eliminates the need for complex 3D 
                modeling software or years of design experience.
              </p>
              <p className="text-white/80 leading-relaxed">
                Simply describe what you want to create in plain English, select an art style, and watch as our AI 
                transforms your words into a detailed 3D model ready for printing or digital use.
              </p>
            </div>
          </motion.section>

          {/* Key Features */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-figuro-accent/20">
                        <feature.icon className="w-6 h-6 text-figuro-accent" />
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* How It Works Overview */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-figuro-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-figuro-accent font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Describe</h3>
                  <p className="text-white/70 text-sm">Write a detailed description of your desired figurine</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-figuro-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-figuro-accent font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Generate</h3>
                  <p className="text-white/70 text-sm">Our AI creates a unique 3D model based on your prompt</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-figuro-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-figuro-accent font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Download</h3>
                  <p className="text-white/70 text-sm">Get your 3D model in multiple formats for printing or use</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Who Can Use Figuro.AI */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Who Can Use Figuro.AI?</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Game Developers</h3>
                <p className="text-white/70">Create unique characters, NPCs, and collectible figurines for your games without hiring 3D artists.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Educators & Students</h3>
                <p className="text-white/70">Bring learning to life with custom 3D models for history, science, and creative projects.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">3D Printing Enthusiasts</h3>
                <p className="text-white/70">Generate unique models for your 3D printer without complex modeling software.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Creative Professionals</h3>
                <p className="text-white/70">Rapid prototyping for concept art, storyboarding, and client presentations.</p>
              </div>
            </div>
          </motion.section>

          {/* Getting Started CTA */}
          <motion.section 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/70 mb-6">
                Now that you understand what Figuro.AI can do, let's create your first figurine!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/docs/creating-your-first-figurine")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Create Your First Figurine
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/studio")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Try the Studio Now
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Introduction;
