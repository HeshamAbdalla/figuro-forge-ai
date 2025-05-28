
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown, ArrowRight, BookOpen, Lightbulb, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Docs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  // FAQ items
  const faqItems = [
    {
      id: "faq-1",
      question: "How does Figuro.AI generate 3D models from text?",
      answer: "Figuro.AI uses advanced machine learning models trained on millions of 3D assets to understand the relationship between text descriptions and 3D shapes. When you provide a text prompt, our AI processes it to extract key features, style information, and structural details to generate a 3D model that matches your description."
    },
    {
      id: "faq-2",
      question: "What file formats can I download my figurines in?",
      answer: "You can download your generated figurines in standard 3D formats including STL, OBJ, and GLB. These formats are compatible with most 3D printing services, modeling software, and game engines."
    },
    {
      id: "faq-3",
      question: "Can I modify the generated 3D models?",
      answer: "Yes, all downloaded models can be modified using your preferred 3D modeling software like Blender, ZBrush, or Maya. This allows you to make fine adjustments or add details before printing."
    },
    {
      id: "faq-4",
      question: "How long does it take to generate a figurine?",
      answer: "The generation process typically takes between 30 seconds to 2 minutes depending on the complexity of your prompt and the selected art style. More detailed and complex figurines may take longer to process."
    },
    {
      id: "faq-5",
      question: "Can I use the figurines for commercial purposes?",
      answer: "Yes, with our Pro and Enterprise plans, you receive full commercial rights to the figurines you create. The Free plan is limited to personal use only."
    }
  ];

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Documentation</h1>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Learn how to use Figuro.AI to create amazing 3D figurines with our comprehensive documentation.
            </p>
          </motion.div>
          
          <Tabs defaultValue="guides" className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white/5">
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="api">API Reference</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="guides">
              {/* Getting Started Section */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => navigate("/docs/introduction")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-figuro-accent" />
                        <div>
                          <CardTitle className="text-white">Introduction to Figuro.AI</CardTitle>
                          <CardDescription className="text-white/70">Learn the basics and core concepts</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 text-sm mb-4">
                        Discover what Figuro.AI can do, who can use it, and how our AI-powered platform transforms text into 3D figurines.
                      </p>
                      <Button variant="ghost" className="w-full justify-between text-figuro-accent hover:bg-figuro-accent/20">
                        Read Guide
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => navigate("/docs/creating-your-first-figurine")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-8 h-8 text-figuro-accent" />
                        <div>
                          <CardTitle className="text-white">Creating Your First Figurine</CardTitle>
                          <CardDescription className="text-white/70">Step-by-step tutorial</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 text-sm mb-4">
                        Follow our detailed walkthrough to create your first 3D figurine, from writing prompts to downloading your model.
                      </p>
                      <Button variant="ghost" className="w-full justify-between text-figuro-accent hover:bg-figuro-accent/20">
                        Start Tutorial
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => navigate("/docs/understanding-art-styles")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Palette className="w-8 h-8 text-figuro-accent" />
                        <div>
                          <CardTitle className="text-white">Understanding Art Styles</CardTitle>
                          <CardDescription className="text-white/70">Master different visual styles</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 text-sm mb-4">
                        Learn about Realistic, Cartoon, Anime, and Fantasy styles to choose the perfect look for your figurines.
                      </p>
                      <Button variant="ghost" className="w-full justify-between text-figuro-accent hover:bg-figuro-accent/20">
                        Explore Styles
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Additional Resources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Advanced Techniques</CardTitle>
                    <CardDescription className="text-white/70">Take your creations to the next level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Prompt engineering tips</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Combining multiple styles</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Preparing models for printing</a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Integration Guides</CardTitle>
                    <CardDescription className="text-white/70">Use Figuro.AI in your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">REST API basics</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Webhooks and callbacks</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Authentication</a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Tutorials</CardTitle>
                    <CardDescription className="text-white/70">Step-by-step walkthroughs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Creating game characters</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Designing miniatures</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Building a collection</a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                    <CardDescription className="text-white/70">Tips from experienced users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Optimizing for 3D printing</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Creating series collections</a>
                      </li>
                      <li>
                        <a href="#" className="text-figuro-accent hover:underline">Quality guidelines</a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription className="text-white/70">
                    Comprehensive documentation for the Figuro.AI API.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Authentication</h3>
                      <p className="text-white/70 mb-2">
                        Authenticate to the Figuro.AI API using API keys that can be generated in your account dashboard.
                      </p>
                      <pre className="bg-black/30 p-4 rounded-md overflow-x-auto text-sm text-white/90">
                        <code>
                          curl -X POST https://api.figuro.ai/v1/generate \<br />
                          {"  "}-H "Authorization: Bearer YOUR_API_KEY" \<br />
                          {"  "}-H "Content-Type: application/json"
                        </code>
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Endpoints</h3>
                      <ul className="space-y-2">
                        <li>
                          <a href="#" className="text-figuro-accent hover:underline">/v1/generate</a> - Generate a new figurine
                        </li>
                        <li>
                          <a href="#" className="text-figuro-accent hover:underline">/v1/models</a> - List your generated models
                        </li>
                        <li>
                          <a href="#" className="text-figuro-accent hover:underline">/v1/styles</a> - Get available art styles
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <Button variant="outline" className="w-full border-white/10 hover:border-white/30">
                        View Full API Documentation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqItems.map((item) => (
                      <Collapsible
                        key={item.id}
                        open={openItem === item.id}
                        onOpenChange={() => toggleItem(item.id)}
                        className="border border-white/10 rounded-lg"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-white/5">
                          <span className="font-medium text-white">{item.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-white/70 transition-transform ${
                              openItem === item.id ? "transform rotate-180" : ""
                            }`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 pt-0 text-white/70 border-t border-white/10">
                          {item.answer}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-b from-transparent to-figuro-accent/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gradient">Need Help?</h2>
            <p className="text-white/70 mb-8">
              Our support team is always ready to assist you with any questions or issues you might have.
              Get in touch and we'll respond as soon as possible.
            </p>
            <Button className="bg-figuro-accent hover:bg-figuro-accent-hover">
              Contact Support
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Docs;
