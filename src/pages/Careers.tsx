
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";

const Careers = () => {
  const benefits = [
    "Competitive salary and equity",
    "Comprehensive health, dental, and vision insurance",
    "Flexible work arrangements and remote options",
    "Professional development budget",
    "State-of-the-art equipment and tools",
    "Collaborative and innovative work environment"
  ];

  const positions = [
    {
      title: "Senior AI Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Lead the development of our next-generation text-to-3D AI models and improve generation quality.",
      requirements: ["PhD/MS in Computer Science, AI, or related field", "5+ years of experience in machine learning", "Experience with 3D graphics and computer vision"]
    },
    {
      title: "Frontend Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Build and optimize our React-based user interface for the best possible user experience.",
      requirements: ["BS in Computer Science or equivalent", "3+ years of React/TypeScript experience", "Experience with 3D visualization libraries"]
    },
    {
      title: "Product Designer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Design intuitive user experiences that make 3D creation accessible to everyone.",
      requirements: ["5+ years of product design experience", "Strong portfolio in web/mobile design", "Experience with design systems and user research"]
    },
    {
      title: "DevOps Engineer",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Scale our infrastructure to handle millions of 3D generation requests efficiently.",
      requirements: ["BS in Computer Science or equivalent", "Experience with AWS/GCP and Kubernetes", "Background in ML infrastructure and model deployment"]
    }
  ];

  return (
    <>
      <SEO 
        title={pageSEO.careers.title}
        description={pageSEO.careers.description}
        keywords={pageSEO.careers.keywords}
        ogType={pageSEO.careers.ogType}
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
                  Join the <span className="text-figuro-accent">Future</span> of 3D Creation
                </h1>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Help us build the next generation of AI-powered creative tools. Join our team of passionate 
                  engineers, designers, and researchers who are revolutionizing how people create 3D content.
                </p>
                <Button 
                  size="lg"
                  className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                  onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Open Positions
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Culture Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Why Work With Us?</h2>
                <p className="text-lg text-white/80 leading-relaxed mb-12">
                  At Figuros.AI, we're building more than just technology – we're creating the future of digital creativity. 
                  Our team is passionate, diverse, and committed to making a real impact on how people create and share their ideas.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-figuro-darker border-white/10 text-center h-full">
                    <CardHeader>
                      <Users className="h-12 w-12 text-figuro-accent mx-auto mb-4" />
                      <CardTitle className="text-white">Innovation-First Culture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70">
                        We encourage experimentation, creative problem-solving, and pushing the boundaries of what's possible with AI.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-figuro-darker border-white/10 text-center h-full">
                    <CardHeader>
                      <Clock className="h-12 w-12 text-figuro-accent mx-auto mb-4" />
                      <CardTitle className="text-white">Work-Life Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70">
                        We believe great work comes from well-rested, happy people. Flexible schedules and unlimited PTO.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-figuro-darker border-white/10 text-center h-full">
                    <CardHeader>
                      <ArrowRight className="h-12 w-12 text-figuro-accent mx-auto mb-4" />
                      <CardTitle className="text-white">Growth Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70">
                        Continuous learning, mentorship, and opportunities to lead projects that impact millions of users.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-figuro-darker/50 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Benefits & Perks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-figuro-accent rounded-full flex-shrink-0" />
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Open Positions */}
          <section id="positions" className="py-20 bg-figuro-darker/50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Open Positions</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  We're always looking for talented individuals who share our passion for innovation and creativity.
                </p>
              </motion.div>

              <div className="max-w-4xl mx-auto space-y-6">
                {positions.map((position, index) => (
                  <motion.div
                    key={position.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-figuro-darker border-white/10 hover:border-figuro-accent/30 transition-colors">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-white text-xl mb-2">{position.title}</CardTitle>
                            <div className="flex flex-wrap gap-4 text-sm text-white/70">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {position.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {position.type}
                              </div>
                            </div>
                          </div>
                          <Button 
                            className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                            onClick={() => window.open('mailto:careers@figuros.ai?subject=Application for ' + position.title)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/80 mb-4">{position.description}</p>
                        <div>
                          <h4 className="font-medium text-white mb-2">Requirements:</h4>
                          <ul className="space-y-1">
                            {position.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start gap-2 text-white/70 text-sm">
                                <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full mt-2 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* No Perfect Match CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Card className="bg-figuro-darker border-white/10 max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4">Don't see a perfect match?</h3>
                    <p className="text-white/70 mb-6">
                      We're always interested in hearing from talented individuals. Send us your resume and tell us 
                      what you're passionate about.
                    </p>
                    <Button 
                      className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                      onClick={() => window.open('mailto:careers@figuros.ai?subject=General Application')}
                    >
                      Send Your Resume
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Careers;
