
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Gamepad2, Users, ShoppingBag, ArrowRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UseCaseExamples = () => {
  const navigate = useNavigate();

  const useCases = [
    {
      icon: <Gift className="w-8 h-8 text-pink-400" />,
      title: "Personalized Gifts",
      description: "Create unique, meaningful gifts for your loved ones",
      examples: ["Custom pet figurines", "Family portraits", "Memorial keepsakes"],
      color: "from-pink-500/20 to-red-500/20",
      borderColor: "border-pink-400/20"
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-purple-400" />,
      title: "Gaming & D&D",
      description: "Bring your characters and campaigns to life",
      examples: ["D&D character models", "Game protagonists", "Boss figurines"],
      color: "from-purple-500/20 to-blue-500/20", 
      borderColor: "border-purple-400/20"
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "Educational Projects",
      description: "Make learning interactive and engaging",
      examples: ["Historical figures", "Science models", "Art projects"],
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-400/20"
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-orange-400" />,
      title: "Business & Marketing",
      description: "Create memorable brand experiences", 
      examples: ["Mascot figurines", "Product prototypes", "Trade show items"],
      color: "from-orange-500/20 to-yellow-500/20",
      borderColor: "border-orange-400/20"
    }
  ];

  const projectIdeas = [
    {
      title: "Design Your Pet as a Superhero",
      prompt: "my golden retriever as a superhero with a cape",
      difficulty: "Easy",
      time: "2 minutes"
    },
    {
      title: "Create a Family Avatar",
      prompt: "cartoon family of 4 with dad, mom, and two kids",
      difficulty: "Easy", 
      time: "3 minutes"
    },
    {
      title: "Build a Fantasy Warrior",
      prompt: "elven archer with magical bow and forest armor",
      difficulty: "Medium",
      time: "4 minutes"
    },
    {
      title: "Design a Steampunk Robot",
      prompt: "Victorian-era robot with brass gears and steam pipes",
      difficulty: "Medium",
      time: "5 minutes"
    }
  ];

  const handleProjectStart = (prompt: string) => {
    navigate(`/studio?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 via-transparent to-orange-500/5" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-400 font-medium">Use Case Ideas</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Endless{" "}
            <span className="text-gradient bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Possibilities
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            From personal keepsakes to business prototypes, discover how creators are using Figuro.AI 
            to bring their ideas to life.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${useCase.color} border ${useCase.borderColor} backdrop-blur-sm h-full`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, exIndex) => (
                      <div key={exIndex} className="text-white/60 text-xs bg-white/10 rounded-full px-3 py-1">
                        {example}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Project Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-3">
              Quick Start Project Ideas
            </h3>
            <p className="text-white/70">
              Not sure where to begin? Try one of these popular project ideas to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {projectIdeas.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 group hover:border-figuro-accent/30 transition-colors duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-white group-hover:text-figuro-accent transition-colors">
                    {project.title}
                  </h4>
                  <div className="text-right">
                    <div className="text-xs text-figuro-accent bg-figuro-accent/20 rounded-full px-2 py-1 mb-1">
                      {project.difficulty}
                    </div>
                    <div className="text-xs text-white/60">
                      ~{project.time}
                    </div>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm mb-4 italic">
                  "{project.prompt}"
                </p>

                <Button 
                  onClick={() => handleProjectStart(project.prompt)}
                  size="sm"
                  className="w-full bg-figuro-accent/20 hover:bg-figuro-accent hover:text-white border border-figuro-accent/30 hover:border-figuro-accent group"
                >
                  Start This Project
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center mt-8"
          >
            <Button 
              onClick={() => navigate('/studio')}
              size="lg"
              className="bg-figuro-accent hover:bg-figuro-accent-hover text-white font-semibold group"
            >
              Create Your Own Project
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-white/50 text-sm mt-3">
              Start with 10 free credits - no signup required
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCaseExamples;
