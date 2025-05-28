
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Printer, Settings, AlertTriangle, CheckCircle, Layers, Ruler, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PreparingModelsForPrinting = () => {
  const navigate = useNavigate();

  const preparationSteps = [
    {
      icon: Settings,
      title: "Scale Verification",
      description: "Ensure your model is the right size for printing",
      details: [
        "Check dimensions in your 3D software",
        "Standard figurines: 25-32mm for tabletop gaming",
        "Larger prints: 75-100mm for display pieces"
      ]
    },
    {
      icon: Wrench,
      title: "Model Repair",
      description: "Fix common issues that prevent successful printing",
      details: [
        "Fill holes and gaps in the mesh",
        "Repair non-manifold edges",
        "Remove duplicate vertices and faces"
      ]
    },
    {
      icon: Layers,
      title: "Support Planning",
      description: "Identify areas that need printing supports",
      details: [
        "Overhangs greater than 45 degrees",
        "Floating elements like weapons or capes",
        "Fine details that might break during printing"
      ]
    }
  ];

  const fileFormats = [
    {
      format: "STL",
      description: "Standard format for 3D printing",
      pros: ["Universal compatibility", "Small file size", "Simple mesh data"],
      cons: ["No color information", "Limited material properties"],
      recommended: "Best for single-material prints"
    },
    {
      format: "OBJ",
      description: "Versatile format with material support",
      pros: ["Material and texture support", "Good editing compatibility", "Color information"],
      cons: ["Larger file sizes", "More complex structure"],
      recommended: "Best for multi-material or textured prints"
    },
    {
      format: "3MF",
      description: "Microsoft's modern 3D printing format",
      pros: ["Full color support", "Print settings included", "Efficient compression"],
      cons: ["Limited software support", "Newer format"],
      recommended: "Best for color 3D printers"
    }
  ];

  const printingTips = [
    {
      category: "Layer Height",
      recommendation: "0.1-0.2mm for detailed figurines",
      explanation: "Lower layer heights capture fine details but increase print time"
    },
    {
      category: "Print Speed",
      recommendation: "20-40mm/s for figurines",
      explanation: "Slower speeds improve quality and reduce layer adhesion issues"
    },
    {
      category: "Infill",
      recommendation: "10-20% for display pieces",
      explanation: "Low infill saves material while maintaining structural integrity"
    },
    {
      category: "Support Density",
      recommendation: "15-25% for complex models",
      explanation: "Enough support for overhangs without difficult removal"
    }
  ];

  const commonIssues = [
    {
      issue: "Stringing between parts",
      solution: "Lower print temperature and increase retraction distance",
      prevention: "Use high-quality filament and calibrate extruder"
    },
    {
      issue: "Poor surface finish",
      solution: "Reduce layer height and print speed",
      prevention: "Ensure bed leveling and proper nozzle height"
    },
    {
      issue: "Failed overhangs",
      solution: "Add more support material or change orientation",
      prevention: "Design with 45-degree rule in mind"
    },
    {
      issue: "Warping and lifting",
      solution: "Use heated bed and enclosure",
      prevention: "Proper bed adhesion and cooling settings"
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
                <BreadcrumbPage className="text-figuro-accent">Preparing Models for 3D Printing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Preparing Models for 3D Printing</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Transform your generated figurines into perfect 3D prints. Learn essential preparation techniques, 
              optimal print settings, and troubleshooting tips to achieve professional-quality physical models.
            </p>
          </motion.div>

          {/* Pre-Print Preparation */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Pre-Print Preparation</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {preparationSteps.map((step, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <step.icon className="w-6 h-6 text-figuro-accent" />
                      <CardTitle className="text-white">{step.title}</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-white/80 text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-1" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* File Formats */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Choosing the Right File Format</h2>
            <div className="space-y-6">
              {fileFormats.map((format, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-3">
                        <Printer className="w-6 h-6 text-figuro-accent" />
                        {format.format}
                      </CardTitle>
                      <span className="text-figuro-accent text-sm font-medium">
                        {format.recommended}
                      </span>
                    </div>
                    <CardDescription className="text-white/70">{format.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-400 mb-2">Advantages:</h4>
                        <ul className="space-y-1">
                          {format.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="text-white/80 text-sm flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-1" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-400 mb-2">Limitations:</h4>
                        <ul className="space-y-1">
                          {format.cons.map((con, conIndex) => (
                            <li key={conIndex} className="text-white/80 text-sm flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-1" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Print Settings */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Optimal Print Settings</h2>
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {printingTips.map((tip, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-figuro-accent" />
                      {tip.category}
                    </h3>
                    <p className="text-figuro-accent font-medium mb-2">{tip.recommendation}</p>
                    <p className="text-white/70 text-sm">{tip.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Troubleshooting */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Common Issues & Solutions</h2>
            <div className="space-y-4">
              {commonIssues.map((item, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      {item.issue}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-yellow-400 mb-2">Solution:</h4>
                        <p className="text-white/80 text-sm">{item.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-400 mb-2">Prevention:</h4>
                        <p className="text-white/80 text-sm">{item.prevention}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Post-Processing */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Post-Processing Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Support Removal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li>• Use flush cutters for clean removal</li>
                    <li>• Sand support attachment points smooth</li>
                    <li>• Use needle files for fine detail work</li>
                    <li>• Be patient with delicate areas</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Surface Finishing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li>• Start with coarse grit, finish with fine</li>
                    <li>• Use primer before painting</li>
                    <li>• Apply thin, even paint coats</li>
                    <li>• Seal with protective clear coat</li>
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
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Print?</h2>
              <p className="text-white/70 mb-6">
                With these preparation techniques, you're ready to create stunning physical figurines from your 
                AI-generated models. Remember, practice makes perfect!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/studio")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Generate Models to Print
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/docs")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Back to Documentation
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

export default PreparingModelsForPrinting;
