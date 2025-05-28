
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, MessageSquare, Palette, Download, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatingYourFirstFigurine = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Access the Studio",
      description: "Navigate to the Figuro.AI Studio from the main menu or dashboard.",
      details: "Click on 'Studio' in the navigation bar or use the 'Start Creating' button on the homepage."
    },
    {
      number: 2,
      title: "Write Your Prompt",
      description: "Describe your figurine in the text input field.",
      details: "Be specific about appearance, pose, clothing, and any accessories you want included."
    },
    {
      number: 3,
      title: "Select Art Style",
      description: "Choose from various art styles like Realistic, Cartoon, Anime, or Fantasy.",
      details: "Each style will give your figurine a different aesthetic and level of detail."
    },
    {
      number: 4,
      title: "Generate Your Figurine",
      description: "Click 'Generate' and wait for the AI to create your 3D model.",
      details: "This typically takes 30 seconds to 2 minutes depending on complexity."
    },
    {
      number: 5,
      title: "Review and Download",
      description: "Examine your generated figurine and download in your preferred format.",
      details: "Available formats include STL for 3D printing, OBJ for editing, and GLB for web use."
    }
  ];

  const promptExamples = [
    {
      category: "Characters",
      examples: [
        "A brave knight in shining armor holding a sword and shield",
        "A wise wizard with a long beard wearing robes and holding a staff",
        "A ninja in black outfit with throwing stars and mask"
      ]
    },
    {
      category: "Fantasy Creatures",
      examples: [
        "A friendly dragon with colorful scales breathing rainbow fire",
        "A cute unicorn with flowing mane and spiral horn",
        "A fierce griffin with eagle head and lion body"
      ]
    },
    {
      category: "Modern Characters",
      examples: [
        "A astronaut in white space suit with helmet and oxygen tank",
        "A chef wearing apron and hat holding cooking utensils",
        "A scientist in lab coat with safety goggles and clipboard"
      ]
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: "Be Descriptive",
      description: "Include details about clothing, pose, facial expressions, and accessories for better results."
    },
    {
      icon: AlertCircle,
      title: "Avoid Copyrighted Characters",
      description: "Create original characters inspired by themes rather than exact copies of existing IP."
    },
    {
      icon: CheckCircle,
      title: "Start Simple",
      description: "Begin with straightforward descriptions before trying complex multi-character scenes."
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
                <BreadcrumbPage className="text-figuro-accent">Creating Your First Figurine</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Creating Your First Figurine</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Ready to bring your imagination to life? This step-by-step guide will walk you through creating 
              your very first 3D figurine with Figuro.AI. By the end of this tutorial, you'll have a 
              downloadable 3D model ready for printing or digital use.
            </p>
          </motion.div>

          {/* Step-by-Step Guide */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Step-by-Step Guide</h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-figuro-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{step.number}</span>
                      </div>
                      <div>
                        <CardTitle className="text-white">{step.title}</CardTitle>
                        <CardDescription className="text-white/70">{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-14">
                    <p className="text-white/80 text-sm">{step.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Prompt Writing Tips */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Writing Effective Prompts</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {tips.map((tip, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <tip.icon className="w-6 h-6 text-figuro-accent" />
                      <CardTitle className="text-white text-lg">{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Prompt Structure */}
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-4">Prompt Structure Formula</h3>
              <div className="bg-black/30 p-4 rounded-lg mb-4">
                <code className="text-figuro-accent">
                  [Character Type] + [Appearance Details] + [Clothing/Accessories] + [Pose/Action] + [Environment Context]
                </code>
              </div>
              <p className="text-white/70 mb-4">Example:</p>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white italic">
                  "A heroic knight with flowing cape, wearing detailed plate armor with gold trim, 
                  holding a glowing sword in battle stance, ready to defend a medieval castle"
                </p>
              </div>
            </div>
          </motion.section>

          {/* Example Prompts */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Example Prompts to Try</h2>
            <div className="space-y-6">
              {promptExamples.map((category, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex} className="bg-white/5 p-3 rounded-lg">
                          <p className="text-white/80 italic">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Troubleshooting */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Common Issues & Solutions</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Generation Taking Too Long?</h3>
                <p className="text-white/70">Complex prompts with multiple characters or intricate details may take longer. Try simplifying your description or breaking it into multiple separate figurines.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Figurine Doesn't Match Description?</h3>
                <p className="text-white/70">Be more specific with your prompt. Include details about pose, facial features, and clothing. Try different art styles as they can significantly affect the output.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">Download Not Working?</h3>
                <p className="text-white/70">Ensure you have a stable internet connection and sufficient storage space. Large files may take time to download. Try refreshing the page if the download fails.</p>
              </div>
            </div>
          </motion.section>

          {/* Next Steps */}
          <motion.section 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Create?</h2>
              <p className="text-white/70 mb-6">
                Now you have all the knowledge needed to create amazing figurines. Start experimenting with different 
                prompts and art styles to discover what works best for your vision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/studio")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Start Creating Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/docs/understanding-art-styles")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Learn About Art Styles
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

export default CreatingYourFirstFigurine;
