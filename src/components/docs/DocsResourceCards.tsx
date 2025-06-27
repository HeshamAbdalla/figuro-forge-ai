
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Webhook, 
  Key, 
  GamepadIcon, 
  PrinterIcon, 
  Users, 
  Zap, 
  Settings,
  ArrowRight
} from "lucide-react";

const DocsResourceCards = () => {
  const resourceSections = [
    {
      title: "API & Integration",
      description: "Connect Figuro.AI to your applications",
      icon: Code,
      gradient: "from-blue-500/10 to-cyan-500/10",
      resources: [
        { name: "REST API basics", href: "#", icon: Code },
        { name: "Webhooks and callbacks", href: "#", icon: Webhook },
        { name: "Authentication guide", href: "#", icon: Key }
      ]
    },
    {
      title: "Tutorials & Examples",
      description: "Learn through practical examples",
      icon: GamepadIcon,
      gradient: "from-purple-500/10 to-pink-500/10",
      resources: [
        { name: "Creating game characters", href: "#", icon: GamepadIcon },
        { name: "Designing miniatures", href: "#", icon: PrinterIcon },
        { name: "Building collections", href: "#", icon: Users }
      ]
    },
    {
      title: "Advanced Workflows",
      description: "Optimize your creative process",
      icon: Zap,
      gradient: "from-orange-500/10 to-yellow-500/10",
      resources: [
        { name: "Batch processing", href: "#", icon: Zap },
        { name: "Automation setup", href: "#", icon: Settings },
        { name: "Custom pipelines", href: "#", icon: Code }
      ]
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">
            Additional Resources
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Dive deeper into advanced features and integrations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {resourceSections.map((section, index) => {
            const IconComponent = section.icon;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <Card className="glass-panel h-full relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                          <IconComponent size={28} className="text-figuro-accent" />
                        </div>
                      </div>
                      <CardTitle className="text-white text-xl mb-2">
                        {section.title}
                      </CardTitle>
                      <p className="text-white/70 text-sm">
                        {section.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {section.resources.map((resource, resourceIndex) => {
                        const ResourceIcon = resource.icon;
                        
                        return (
                          <Button
                            key={resource.name}
                            variant="ghost"
                            className="w-full justify-between text-left hover:bg-white/10 hover:text-figuro-accent transition-all duration-200"
                            asChild
                          >
                            <a href={resource.href} className="flex items-center gap-3">
                              <ResourceIcon size={16} className="text-figuro-accent" />
                              <span className="flex-1">{resource.name}</span>
                              <ArrowRight size={14} className="opacity-60" />
                            </a>
                          </Button>
                        );
                      })}
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DocsResourceCards;
