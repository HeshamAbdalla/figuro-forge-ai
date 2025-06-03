
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Target, Lightbulb, Award } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8 text-figuro-accent" />,
      title: "Innovation",
      description: "We push the boundaries of AI technology to make 3D creation accessible to everyone."
    },
    {
      icon: <Users className="h-8 w-8 text-figuro-accent" />,
      title: "Community",
      description: "We believe in empowering creators and building a supportive community around digital art."
    },
    {
      icon: <Target className="h-8 w-8 text-figuro-accent" />,
      title: "Quality",
      description: "We're committed to delivering high-quality 3D models that exceed expectations."
    },
    {
      icon: <Award className="h-8 w-8 text-figuro-accent" />,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our platform and user experience."
    }
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Co-Founder",
      description: "Former AI researcher at Stanford with a passion for democratizing 3D creation."
    },
    {
      name: "Sarah Rodriguez",
      role: "CTO & Co-Founder",
      description: "Expert in computer graphics and machine learning with 10+ years in the industry."
    },
    {
      name: "Michael Kim",
      role: "Head of Design",
      description: "Award-winning designer who believes in the power of intuitive user experiences."
    },
    {
      name: "Emily Johnson",
      role: "Lead AI Engineer",
      description: "PhD in Computer Vision, specializing in text-to-3D generation algorithms."
    }
  ];

  return (
    <>
      <SEO 
        title={pageSEO.about.title}
        description={pageSEO.about.description}
        keywords={pageSEO.about.keywords}
        ogType={pageSEO.about.ogType}
      />
      <div className="min-h-screen bg-figuro-dark text-white">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-b from-figuro-darker to-figuro-dark">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  About <span className="text-figuro-accent">Figuros.AI</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  We're on a mission to democratize 3D creation by making it as simple as describing what you imagine. 
                  Our AI-powered platform transforms text prompts into stunning 3D figurines, ready for printing and sharing.
                </p>
                <Button 
                  size="lg"
                  className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                  onClick={() => navigate("/studio")}
                >
                  Start Creating
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-white/80 leading-relaxed">
                  To bridge the gap between imagination and creation. We believe that everyone should be able to bring 
                  their ideas to life in 3D, regardless of their technical expertise. Through the power of artificial 
                  intelligence, we're making 3D design accessible, intuitive, and fun for creators worldwide.
                </p>
              </motion.div>

              {/* Values Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-figuro-darker border-white/10 text-center h-full">
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          {value.icon}
                        </div>
                        <CardTitle className="text-white">{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-20 bg-figuro-darker/50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  We're a passionate team of engineers, designers, and AI researchers united by a shared vision 
                  of making 3D creation accessible to everyone.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-figuro-darker border-white/10 text-center h-full">
                      <CardHeader>
                        <div className="w-20 h-20 bg-figuro-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Users className="h-10 w-10 text-figuro-accent" />
                        </div>
                        <CardTitle className="text-white">{member.name}</CardTitle>
                        <p className="text-figuro-accent font-medium">{member.role}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 text-sm">{member.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who are already bringing their ideas to life with Figuros.AI
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                    onClick={() => navigate("/studio")}
                  >
                    Start Creating
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => navigate("/gallery")}
                  >
                    Explore Gallery
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;
