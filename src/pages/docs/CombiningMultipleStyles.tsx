
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Palette, Layers, Sparkles, Eye, Blend, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CombiningMultipleStyles = () => {
  const navigate = useNavigate();

  const styleCombinations = [
    {
      combination: "Realistic + Fantasy",
      description: "Lifelike proportions with magical elements",
      example: "A photorealistic wizard with glowing magical runes on detailed robes",
      difficulty: "Beginner",
      color: "text-green-400"
    },
    {
      combination: "Anime + Cyberpunk",
      description: "Large-eyed characters in futuristic settings",
      example: "An anime-style hacker with neon cybernetic implants and oversized eyes",
      difficulty: "Intermediate",
      color: "text-yellow-400"
    },
    {
      combination: "Cartoon + Horror",
      description: "Playful style with spooky elements",
      example: "A cute cartoon vampire with friendly smile and colorful gothic outfit",
      difficulty: "Advanced",
      color: "text-red-400"
    }
  ];

  const techniques = [
    {
      icon: Layers,
      title: "Layered Descriptions",
      description: "Build complexity by layering style elements throughout your prompt",
      tips: [
        "Start with primary style foundation",
        "Add secondary style modifiers",
        "Include specific style-blend keywords"
      ]
    },
    {
      icon: Blend,
      title: "Transition Words",
      description: "Use blending keywords to smooth style combinations",
      tips: [
        "Use 'with touches of...'",
        "Try 'influenced by...'",
        "Include 'combining... and...'"
      ]
    },
    {
      icon: Eye,
      title: "Focus Points",
      description: "Designate which elements use which style",
      tips: [
        "Specify style per body part",
        "Assign styles to clothing vs character",
        "Balance dominant vs accent styles"
      ]
    }
  ];

  const examples = [
    {
      title: "Realistic-Fantasy Warrior",
      prompt: "A photorealistic medieval knight with fantasy elements: realistic armor proportions and weathered metal textures, but with glowing blue magical sword and ethereal energy aura, detailed facial features with mystical glowing eyes",
      styles: ["Realistic", "Fantasy"],
      result: "Maintains realistic proportions while adding magical flair"
    },
    {
      title: "Anime-Steampunk Inventor",
      prompt: "An anime-style character with large expressive eyes and colorful hair, wearing detailed steampunk goggles and brass mechanical arm, combining cute anime proportions with intricate Victorian-era machinery and copper textures",
      styles: ["Anime", "Steampunk"],
      result: "Cute character design with complex mechanical details"
    },
    {
      title: "Cartoon-Gothic Princess",
      prompt: "A cartoon princess with simplified rounded features and bright colors, but wearing elegant gothic dress with dark lace details, combining Disney-style cheerful expression with dramatic dark romantic fashion",
      styles: ["Cartoon", "Gothic"],
      result: "Approachable character with sophisticated dark aesthetics"
    }
  ];

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs" className="text-white/70 hover:text-white">Documentation</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-figuro-accent">Combining Multiple Styles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Combining Multiple Styles</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Create unique and captivating figurines by masterfully blending different art styles. Learn advanced 
              techniques for combining aesthetics to produce truly one-of-a-kind characters that stand out from the crowd.
            </p>
          </motion.div>

          {/* Style Fusion Basics */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Popular Style Combinations</h2>
            <div className="space-y-6">
              {styleCombinations.map((combo, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-3">
                        <Palette className="w-6 h-6 text-figuro-accent" />
                        {combo.combination}
                      </CardTitle>
                      <span className={`text-sm font-medium ${combo.color}`}>
                        {combo.difficulty}
                      </span>
                    </div>
                    <CardDescription className="text-white/70">{combo.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <p className="text-white/90 italic">"{combo.example}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Blending Techniques */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Blending Techniques</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {techniques.map((technique, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <technique.icon className="w-6 h-6 text-figuro-accent" />
                      <CardTitle className="text-white">{technique.title}</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">{technique.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {technique.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-white/80 text-sm flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-figuro-accent flex-shrink-0 mt-1" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Detailed Examples */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Detailed Examples</h2>
            <div className="space-y-8">
              {examples.map((example, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <CardTitle className="text-white">{example.title}</CardTitle>
                      <div className="flex gap-2">
                        {example.styles.map((style, styleIndex) => (
                          <span 
                            key={styleIndex}
                            className="px-3 py-1 bg-figuro-accent/20 text-figuro-accent rounded-full text-sm"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Prompt:</h4>
                        <div className="bg-black/30 p-4 rounded-lg">
                          <p className="text-white/90 italic">"{example.prompt}"</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Result:</h4>
                        <p className="text-white/70">{example.result}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Advanced Tips */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Advanced Style Blending</h2>
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-figuro-accent" />
                    Master Tips
                  </h3>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-figuro-accent rounded-full mt-2 flex-shrink-0"></div>
                      Use percentage weights: "70% realistic, 30% cartoon style"
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-figuro-accent rounded-full mt-2 flex-shrink-0"></div>
                      Specify which features get which style
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-figuro-accent rounded-full mt-2 flex-shrink-0"></div>
                      Balance contrasting elements carefully
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-figuro-accent rounded-full mt-2 flex-shrink-0"></div>
                      Test combinations with simple characters first
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Common Pitfalls</h3>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      Mixing too many conflicting styles
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      Not specifying which elements use which style
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      Using vague blending instructions
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      Expecting perfect results without iteration
                    </li>
                  </ul>
                </div>
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
              <h2 className="text-2xl font-bold text-white mb-4">Start Experimenting!</h2>
              <p className="text-white/70 mb-6">
                Style blending is an art that improves with practice. Start with simple combinations and gradually 
                work your way up to more complex multi-style figurines.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/studio")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Try Style Combinations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/docs/preparing-models-for-printing")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Learn About 3D Printing
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

export default CombiningMultipleStyles;
