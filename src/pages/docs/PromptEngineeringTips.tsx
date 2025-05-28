
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Lightbulb, Target, Zap, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PromptEngineeringTips = () => {
  const navigate = useNavigate();

  const techniques = [
    {
      icon: Target,
      title: "Be Specific",
      description: "Use precise descriptors for better results",
      tips: [
        "Instead of 'warrior', use 'armored knight with silver chainmail'",
        "Specify materials: 'leather boots' vs 'steel-plated boots'",
        "Include scale references: 'towering giant' vs 'human-sized'"
      ]
    },
    {
      icon: Zap,
      title: "Action Words",
      description: "Dynamic poses create engaging figurines",
      tips: [
        "Use verbs: 'charging', 'casting spell', 'defending'",
        "Describe momentum: 'cape flowing in wind'",
        "Include interaction: 'gripping sword handle tightly'"
      ]
    },
    {
      icon: Star,
      title: "Layered Details",
      description: "Build complexity with multiple descriptive layers",
      tips: [
        "Start with basic form, add clothing, then accessories",
        "Include facial expressions and body language",
        "Add environmental context when relevant"
      ]
    }
  ];

  const promptStructures = [
    {
      title: "Character Foundation",
      structure: "[Character Type] + [Physical Build] + [Age/Gender]",
      example: "A tall, muscular female orc warrior"
    },
    {
      title: "Appearance Details",
      structure: "[Skin/Hair] + [Facial Features] + [Expression]",
      example: "with green skin, braided black hair, and fierce amber eyes"
    },
    {
      title: "Clothing & Gear",
      structure: "[Primary Outfit] + [Armor/Accessories] + [Weapons]",
      example: "wearing studded leather armor with iron shoulder guards, wielding a massive two-handed axe"
    },
    {
      title: "Pose & Action",
      structure: "[Stance] + [Action] + [Emotional State]",
      example: "standing in battle stance, raising axe triumphantly with confident expression"
    }
  ];

  const commonMistakes = [
    {
      mistake: "Too many characters in one prompt",
      solution: "Focus on one main character per generation",
      icon: AlertTriangle
    },
    {
      mistake: "Vague descriptors like 'cool' or 'awesome'",
      solution: "Use specific visual terms instead",
      icon: Target
    },
    {
      mistake: "Contradictory descriptions",
      solution: "Ensure all elements work together logically",
      icon: CheckCircle
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
                <BreadcrumbPage className="text-figuro-accent">Prompt Engineering Tips</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Prompt Engineering Tips</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Master the art of prompt writing to create exactly the figurines you envision. These advanced techniques 
              will help you craft precise descriptions that produce consistent, high-quality results.
            </p>
          </motion.div>

          {/* Core Techniques */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Core Techniques</h2>
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
                          <div className="w-1 h-1 bg-figuro-accent rounded-full mt-2 flex-shrink-0"></div>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Prompt Structure Framework */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">The FIGURO Framework</h2>
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8 mb-8">
              <p className="text-white/80 mb-6">
                Use this framework to structure your prompts for maximum effectiveness:
              </p>
              <div className="space-y-6">
                {promptStructures.map((structure, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">{structure.title}</h3>
                    <div className="mb-2">
                      <code className="text-figuro-accent text-sm">{structure.structure}</code>
                    </div>
                    <p className="text-white/70 italic text-sm">"{structure.example}"</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-black/30 p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-4">Complete Example:</h3>
              <p className="text-white/90 italic leading-relaxed">
                "A tall, muscular female orc warrior with green skin, braided black hair, and fierce amber eyes, 
                wearing studded leather armor with iron shoulder guards, wielding a massive two-handed axe, 
                standing in battle stance, raising axe triumphantly with confident expression"
              </p>
            </div>
          </motion.section>

          {/* Common Mistakes */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Common Mistakes to Avoid</h2>
            <div className="space-y-4">
              {commonMistakes.map((item, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <item.icon className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-2">❌ {item.mistake}</h3>
                        <p className="text-green-400">✅ {item.solution}</p>
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
            <h2 className="text-2xl font-bold text-white mb-8">Pro Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-figuro-accent" />
                    Use Reference Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 mb-3">
                    Include familiar references to help the AI understand your vision:
                  </p>
                  <ul className="space-y-1 text-white/80 text-sm">
                    <li>• "Medieval knight like those in fantasy games"</li>
                    <li>• "Steampunk aesthetic with brass gears"</li>
                    <li>• "Anime-style proportions with large eyes"</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-figuro-accent" />
                    Iterate and Refine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 mb-3">
                    Start simple and add details progressively:
                  </p>
                  <ul className="space-y-1 text-white/80 text-sm">
                    <li>• Generate basic concept first</li>
                    <li>• Add specific details in follow-up prompts</li>
                    <li>• Use successful elements in future creations</li>
                  </ul>
                </CardContent>
              </Card>
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
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Master Prompts?</h2>
              <p className="text-white/70 mb-6">
                Apply these techniques in the Studio and see immediate improvements in your figurine generation quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/studio")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Practice in Studio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/docs/combining-multiple-styles")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Learn Style Combinations
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

export default PromptEngineeringTips;
