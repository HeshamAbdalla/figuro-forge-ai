
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsHero from "@/components/docs/DocsHero";
import DocsGettingStarted from "@/components/docs/DocsGettingStarted";
import DocsResourceCards from "@/components/docs/DocsResourceCards";
import DocsCallToAction from "@/components/docs/DocsCallToAction";
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
import { ChevronDown, Code, HelpCircle } from "lucide-react";
import SEO from "@/components/SEO";

const Docs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

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
      <SEO 
        title="Documentation - Figuro.AI"
        description="Comprehensive guides and tutorials for mastering AI-powered 3D creation with Figuro.AI"
      />
      <Header />
      
      <main className="pt-20">
        <DocsHero />
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="guides" className="max-w-6xl mx-auto">
              <div className="flex justify-center mb-12">
                <div className="glass-panel p-2 rounded-lg">
                  <TabsList className="bg-transparent gap-2">
                    <TabsTrigger 
                      value="guides" 
                      className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white px-8 py-3 rounded-md font-medium transition-all duration-200"
                    >
                      Guides
                    </TabsTrigger>
                    <TabsTrigger 
                      value="api" 
                      className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white px-8 py-3 rounded-md font-medium transition-all duration-200"
                    >
                      API Reference
                    </TabsTrigger>
                    <TabsTrigger 
                      value="faq" 
                      className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white px-8 py-3 rounded-md font-medium transition-all duration-200"
                    >
                      FAQ
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="guides">
                <DocsGettingStarted />
                <DocsResourceCards />
              </TabsContent>
              
              <TabsContent value="api">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-4xl mx-auto"
                >
                  <Card className="glass-panel border-white/10">
                    <CardHeader className="text-center pb-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                          <Code size={32} className="text-figuro-accent" />
                        </div>
                      </div>
                      <CardTitle className="text-white text-3xl mb-4">API Reference</CardTitle>
                      <CardDescription className="text-white/70 text-lg">
                        Comprehensive documentation for the Figuro.AI API
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div className="glass-panel p-6">
                          <h3 className="text-xl font-semibold text-white mb-4">Authentication</h3>
                          <p className="text-white/70 mb-4">
                            Authenticate to the Figuro.AI API using API keys that can be generated in your account dashboard.
                          </p>
                          <div className="bg-black/30 p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm text-white/90">
                              <code>
                                curl -X POST https://api.figuro.ai/v1/generate \<br />
                                {"  "}-H "Authorization: Bearer YOUR_API_KEY" \<br />
                                {"  "}-H "Content-Type: application/json"
                              </code>
                            </pre>
                          </div>
                        </div>
                        
                        <div className="glass-panel p-6">
                          <h3 className="text-xl font-semibold text-white mb-4">Endpoints</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                              <span className="text-figuro-accent font-mono">/v1/generate</span>
                              <span className="text-white/70">Generate a new figurine</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                              <span className="text-figuro-accent font-mono">/v1/models</span>
                              <span className="text-white/70">List your generated models</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                              <span className="text-figuro-accent font-mono">/v1/styles</span>
                              <span className="text-white/70">Get available art styles</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Button 
                            variant="outline" 
                            className="border-figuro-accent/50 hover:border-figuro-accent hover:bg-figuro-accent/10 text-figuro-accent px-8 py-3"
                          >
                            View Full API Documentation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="faq">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-6">
                      <HelpCircle size={32} className="text-figuro-accent" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-white">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-white/70">
                      Everything you need to know about Figuro.AI
                    </p>
                  </div>

                  <Card className="glass-panel border-white/10">
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        {faqItems.map((item) => (
                          <Collapsible
                            key={item.id}
                            open={openItem === item.id}
                            onOpenChange={() => toggleItem(item.id)}
                            className="glass-panel border-white/10 rounded-lg overflow-hidden"
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-white/5 transition-colors">
                              <span className="font-semibold text-white text-lg">{item.question}</span>
                              <ChevronDown
                                className={`h-5 w-5 text-figuro-accent transition-transform duration-200 ${
                                  openItem === item.id ? "transform rotate-180" : ""
                                }`}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-6 pb-6 text-white/80 leading-relaxed border-t border-white/10">
                              <div className="pt-4">
                                {item.answer}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <DocsCallToAction />
      </main>
      
      <Footer />
    </div>
  );
};

export default Docs;
