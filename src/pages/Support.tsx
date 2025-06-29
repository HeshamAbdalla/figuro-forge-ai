
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Users,
  Zap
} from "lucide-react";

const Support = () => {
  const { user, profile, isLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If authentication is complete (not loading) and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  const handleContactSupport = (method: string) => {
    toast({
      title: "Support Request",
      description: `We'll get back to you via ${method} within 24 hours.`,
    });
  };
  
  // If still loading or no user, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Get help with your account, learn how to use Figuros, or contact our support team
              </p>
            </div>
            
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid grid-cols-3 max-w-[600px] mx-auto mb-8">
                <TabsTrigger value="help">Get Help</TabsTrigger>
                <TabsTrigger value="contact">Contact Us</TabsTrigger>
                <TabsTrigger value="status">System Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="help" className="space-y-8">
                {/* Quick Help Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <Card className="bg-figuro-darker/50 border-white/10 hover:border-figuro-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <BookOpen className="h-6 w-6 text-figuro-accent" />
                        Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Learn how to create amazing figurines with our comprehensive guides
                      </p>
                      <Button 
                        onClick={() => navigate("/docs")}
                        className="w-full"
                        variant="outline"
                      >
                        View Docs
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-figuro-darker/50 border-white/10 hover:border-figuro-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <Users className="h-6 w-6 text-figuro-accent" />
                        Community
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Connect with other creators and share your figurines
                      </p>
                      <Button 
                        onClick={() => navigate("/gallery")}
                        className="w-full"
                        variant="outline"
                      >
                        View Gallery
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-figuro-darker/50 border-white/10 hover:border-figuro-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <Zap className="h-6 w-6 text-figuro-accent" />
                        Quick Start
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Jump right in and create your first figurine
                      </p>
                      <Button 
                        onClick={() => navigate("/studio")}
                        className="w-full"
                      >
                        Start Creating
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* FAQ Section */}
                <Card className="bg-figuro-darker/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-2">How do I create my first figurine?</h3>
                      <p className="text-white/70">
                        Visit our Studio and choose from Text-to-3D, Image-to-3D, or Camera capture options. 
                        Follow the prompts to generate your first figurine.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-semibold mb-2">What file formats are supported?</h3>
                      <p className="text-white/70">
                        We support common image formats (JPG, PNG, GIF) for input and generate 3D models 
                        in STL format for 3D printing.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-semibold mb-2">How do I upgrade my plan?</h3>
                      <p className="text-white/70">
                        Visit the Pricing page or go to your Profile settings to view and upgrade your subscription plan.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-figuro-darker/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <Mail className="h-6 w-6 text-figuro-accent" />
                        Email Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Get detailed help via email. We typically respond within 24 hours.
                      </p>
                      <Button 
                        onClick={() => handleContactSupport("email")}
                        className="w-full"
                        variant="outline"
                      >
                        Send Email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-figuro-darker/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <MessageCircle className="h-6 w-6 text-figuro-accent" />
                        Live Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">
                        Chat with our support team in real-time during business hours.
                      </p>
                      <Button 
                        onClick={() => handleContactSupport("chat")}
                        className="w-full"
                      >
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-figuro-darker/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                      <Clock className="h-6 w-6 text-figuro-accent" />
                      Support Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Email Support</h4>
                        <p className="text-white/70">24/7 - We'll respond within 24 hours</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Live Chat</h4>
                        <p className="text-white/70">Monday - Friday, 9 AM - 6 PM PST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="status" className="space-y-6">
                <Card className="bg-figuro-darker/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">API Services</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">3D Generation</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">File Storage</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-white">Authentication</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Operational
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Support;
