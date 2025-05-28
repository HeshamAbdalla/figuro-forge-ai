
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Palette, Eye, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnderstandingArtStyles = () => {
  const navigate = useNavigate();

  const artStyles = [
    {
      name: "Realistic",
      icon: Eye,
      description: "Lifelike proportions and detailed textures",
      bestFor: "Professional projects, educational models, detailed character studies",
      characteristics: [
        "Accurate human proportions",
        "Detailed facial features",
        "Realistic textures and materials",
        "Natural lighting and shadows"
      ],
      whenToUse: "Choose Realistic when you need figurines that look like real people or objects. Perfect for educational purposes, professional presentations, or when accuracy is more important than artistic stylization."
    },
    {
      name: "Cartoon",
      icon: Sparkles,
      description: "Exaggerated features with a playful, animated look",
      bestFor: "Children's projects, mascots, fun collectibles",
      characteristics: [
        "Oversized heads and eyes",
        "Simplified body proportions",
        "Bright, vibrant colors",
        "Smooth, clean surfaces"
      ],
      whenToUse: "Perfect for creating friendly, approachable characters. Great for children's toys, educational materials, or when you want to convey a sense of fun and whimsy."
    },
    {
      name: "Anime",
      icon: Zap,
      description: "Japanese animation-inspired with distinctive features",
      bestFor: "Pop culture collectibles, gaming figurines, fan art",
      characteristics: [
        "Large expressive eyes",
        "Detailed hair with flowing strands",
        "Stylized facial features",
        "Dynamic action poses"
      ],
      whenToUse: "Ideal for creating characters inspired by Japanese animation and manga. Popular for collectibles, gaming miniatures, and pop culture references."
    },
    {
      name: "Fantasy",
      icon: Palette,
      description: "Magical and mythical with enchanted elements",
      bestFor: "RPG miniatures, fantasy collectibles, magical creatures",
      characteristics: [
        "Elaborate costumes and armor",
        "Magical effects and auras",
        "Mythical creature features",
        "Ornate weapons and accessories"
      ],
      whenToUse: "Best for creating magical characters, mythical creatures, or fantasy-themed figurines. Perfect for tabletop gaming, fantasy collections, or magical storytelling."
    }
  ];

  const styleComparisons = [
    {
      prompt: "A brave warrior with sword and shield",
      styles: {
        realistic: "Creates a historically accurate medieval knight with proper armor proportions and realistic weaponry",
        cartoon: "Produces a friendly hero with oversized features, bright colors, and a cheerful expression",
        anime: "Generates a stylized fighter with flowing hair, large eyes, and dynamic pose",
        fantasy: "Develops an enchanted knight with magical armor, glowing sword, and mystical aura"
      }
    },
    {
      prompt: "A wise old wizard",
      styles: {
        realistic: "Generates an elderly man with detailed wrinkles, realistic robes, and natural proportions",
        cartoon: "Creates a jolly character with exaggerated beard, bright robes, and friendly smile",
        anime: "Produces a mystical figure with flowing robes, expressive eyes, and stylized features",
        fantasy: "Develops a powerful mage with elaborate robes, magical staff, and arcane symbols"
      }
    }
  ];

  const tips = [
    {
      title: "Match Style to Purpose",
      description: "Consider who will see your figurine and what it's for. Professional presentations need Realistic, while gifts for children work better with Cartoon."
    },
    {
      title: "Experiment with Combinations",
      description: "Try the same prompt with different styles to see how dramatically the results can vary. This helps you understand each style's strengths."
    },
    {
      title: "Consider Your Audience",
      description: "Anime style resonates with younger audiences and gaming communities, while Realistic appeals to professional and educational contexts."
    },
    {
      title: "Think About Printing",
      description: "Some styles translate better to 3D printing. Cartoon styles often have fewer small details that could be lost in printing."
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
                <BreadcrumbPage className="text-figuro-accent">Understanding Art Styles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Understanding Art Styles</h1>
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Art styles dramatically influence how your figurine looks and feels. Each style brings its own aesthetic, 
              level of detail, and emotional tone to your creation. Understanding these differences will help you choose 
              the perfect style for your project.
            </p>
          </motion.div>

          {/* Art Styles Overview */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Available Art Styles</h2>
            <div className="space-y-8">
              {artStyles.map((style, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-figuro-accent/20">
                        <style.icon className="w-8 h-8 text-figuro-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{style.name}</CardTitle>
                        <CardDescription className="text-white/70">{style.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Key Characteristics:</h4>
                        <ul className="space-y-2">
                          {style.characteristics.map((char, charIndex) => (
                            <li key={charIndex} className="text-white/70 text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full"></div>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Best For:</h4>
                        <p className="text-white/70 text-sm mb-4">{style.bestFor}</p>
                        <h4 className="font-semibold text-white mb-3">When to Use:</h4>
                        <p className="text-white/70 text-sm">{style.whenToUse}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Style Comparisons */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Style Comparisons</h2>
            <p className="text-white/70 mb-6">
              See how the same prompt produces different results across art styles:
            </p>
            {styleComparisons.map((comparison, index) => (
              <Card key={index} className="bg-white/5 border-white/10 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Prompt: "{comparison.prompt}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-figuro-accent mb-2">Realistic Style</h4>
                        <p className="text-white/70 text-sm">{comparison.styles.realistic}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-figuro-accent mb-2">Cartoon Style</h4>
                        <p className="text-white/70 text-sm">{comparison.styles.cartoon}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-figuro-accent mb-2">Anime Style</h4>
                        <p className="text-white/70 text-sm">{comparison.styles.anime}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-figuro-accent mb-2">Fantasy Style</h4>
                        <p className="text-white/70 text-sm">{comparison.styles.fantasy}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.section>

          {/* Choosing the Right Style */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Tips for Choosing the Right Style</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Quick Reference Guide */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Reference Guide</h2>
            <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-white/10 rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-white mb-4">For Professional Use:</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• Business presentations → <span className="text-figuro-accent">Realistic</span></li>
                    <li>• Educational models → <span className="text-figuro-accent">Realistic</span></li>
                    <li>• Medical/Scientific → <span className="text-figuro-accent">Realistic</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-4">For Entertainment:</h3>
                  <ul className="space-y-2 text-white/70">
                    <li>• Children's toys → <span className="text-figuro-accent">Cartoon</span></li>
                    <li>• Gaming miniatures → <span className="text-figuro-accent">Fantasy/Anime</span></li>
                    <li>• Pop culture figures → <span className="text-figuro-accent">Anime</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 border border-white/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Experiment?</h2>
              <p className="text-white/70 mb-6">
                Now that you understand art styles, try creating the same figurine in different styles 
                to see the dramatic differences for yourself!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/studio")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  Try Different Styles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/gallery")}
                  className="border-white/30 hover:border-white hover:bg-white/10"
                >
                  Browse Gallery Examples
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

export default UnderstandingArtStyles;
