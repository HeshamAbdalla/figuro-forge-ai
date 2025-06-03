
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const mailtoLink = `mailto:support@figuros.ai?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    window.open(mailtoLink);
    
    toast({
      title: "Email client opened",
      description: "Your default email client should open with the message pre-filled.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8 text-figuro-accent" />,
      title: "Email Support",
      description: "Get help with technical issues, billing questions, or general inquiries.",
      contact: "support@figuros.ai",
      action: () => window.open('mailto:support@figuros.ai')
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-figuro-accent" />,
      title: "Discord Community",
      description: "Join our community for tips, inspiration, and peer support.",
      contact: "Join Discord",
      action: () => window.open('https://discord.gg/figuros-ai')
    },
    {
      icon: <Clock className="h-8 w-8 text-figuro-accent" />,
      title: "Response Time",
      description: "We typically respond to support requests within 24 hours.",
      contact: "24 hours or less",
      action: null
    }
  ];

  const subjects = [
    "Technical Support",
    "Billing Question",
    "Feature Request",
    "Partnership Inquiry",
    "Press/Media",
    "General Question"
  ];

  return (
    <>
      <SEO 
        title={pageSEO.contact.title}
        description={pageSEO.contact.description}
        keywords={pageSEO.contact.keywords}
        ogType={pageSEO.contact.ogType}
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
                  Get in <span className="text-figuro-accent">Touch</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Have questions about Figuros.AI? Need technical support? Want to partner with us? 
                  We'd love to hear from you and help you succeed with our platform.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Contact Methods */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card 
                      className={`bg-figuro-darker border-white/10 text-center h-full ${
                        method.action ? 'hover:border-figuro-accent/30 cursor-pointer transition-colors' : ''
                      }`}
                      onClick={method.action || undefined}
                    >
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          {method.icon}
                        </div>
                        <CardTitle className="text-white">{method.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 mb-4">{method.description}</p>
                        <p className="text-figuro-accent font-medium">{method.contact}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="py-20 bg-figuro-darker/50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-6">Send Us a Message</h2>
                  <p className="text-lg text-white/80">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <Card className="bg-figuro-darker border-white/10">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white">Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="bg-figuro-dark border-white/20 text-white placeholder:text-white/50"
                            placeholder="Your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="bg-figuro-dark border-white/20 text-white placeholder:text-white/50"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-white">Subject *</Label>
                        <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                          <SelectTrigger className="bg-figuro-dark border-white/20 text-white">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-white">Message *</Label>
                        <Textarea
                          id="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className="bg-figuro-dark border-white/20 text-white placeholder:text-white/50 resize-none"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <Button 
                        type="submit"
                        size="lg"
                        className="w-full bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                      >
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Here are some common questions we receive. Can't find what you're looking for? Feel free to reach out.
                </p>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-6">
                {[
                  {
                    question: "How long does it take to generate a 3D model?",
                    answer: "Most 3D models are generated within 5-15 minutes, depending on the complexity and current queue length."
                  },
                  {
                    question: "What file formats do you support for download?",
                    answer: "We support STL, OBJ, and PLY formats for 3D printing and visualization across different platforms."
                  },
                  {
                    question: "Can I use the generated models commercially?",
                    answer: "Yes! With our paid plans, you have full commercial rights to use the models you generate."
                  },
                  {
                    question: "Do you offer refunds?",
                    answer: "We offer refunds within 30 days of purchase if you're not satisfied with our service. Contact support for assistance."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-figuro-darker border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
