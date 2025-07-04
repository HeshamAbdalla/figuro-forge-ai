
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Database,
  Zap,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { RLSPerformanceMonitor } from "@/components/security/RLSPerformanceMonitor";
import { OptimizedSecurityWrapper } from "@/components/security/OptimizedSecurityWrapper";
import { EnhancedRLSAuditDashboard } from "@/components/security/EnhancedRLSAuditDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SecurityDashboard = () => {
  const { user, profile, isLoading } = useEnhancedAuth();
  const [securityHealth, setSecurityHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  const fetchSecurityHealth = async () => {
    try {
      setLoading(true);
      
      // Use the enhanced security health check
      const { data, error } = await supabase.rpc('enhanced_security_health_check');
      
      if (error) throw error;
      
      setSecurityHealth(data);
      console.log('🔒 [SECURITY-DASHBOARD] Health check completed:', data);
      
    } catch (error: any) {
      console.error('❌ [SECURITY-DASHBOARD] Error fetching security health:', error);
      toast({
        title: "Error",
        description: "Could not load security dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecurityHealth();
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-figuro-accent mx-auto" />
            <p className="text-white/70">Loading security dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is admin
  const isAdmin = profile?.plan === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-md mx-auto"
          >
            <Shield className="h-16 w-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-white/70">
              You need administrator privileges to access the security dashboard.
            </p>
            <Button onClick={() => navigate("/profile")}>
              Back to Profile
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'WARNING': return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'CRITICAL': return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <OptimizedSecurityWrapper enablePerformanceMonitoring={true}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        
        <section className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header */}
              <div className="mb-10 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
                  <p className="text-white/70">Enhanced monitoring with comprehensive RLS audit and optimization</p>
                </div>
                <Button 
                  onClick={fetchSecurityHealth}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Security Dashboard Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-figuro-darker/50 border-white/10">
                  <TabsTrigger value="overview" className="text-white data-[state=active]:bg-figuro-accent">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="rls-audit" className="text-white data-[state=active]:bg-figuro-accent">
                    Enhanced RLS Audit
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="text-white data-[state=active]:bg-figuro-accent">
                    Performance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {securityHealth && (
                    <div className="grid gap-6">
                      {/* Security Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-figuro-darker/50 border-white/10">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white/70">Security Score</p>
                                <p className={`text-2xl font-bold ${getSecurityScoreColor(securityHealth.security_score)}`}>
                                  {securityHealth.security_score}
                                </p>
                              </div>
                              <TrendingUp className={`h-8 w-8 ${getSecurityScoreColor(securityHealth.security_score)}`} />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-figuro-darker/50 border-white/10">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white/70">Admin Users</p>
                                <p className="text-2xl font-bold text-white">{securityHealth.admin_count}</p>
                              </div>
                              <Users className="h-8 w-8 text-figuro-accent" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-figuro-darker/50 border-white/10">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white/70">Recent Failures</p>
                                <p className="text-2xl font-bold text-white">{securityHealth.recent_failures}</p>
                              </div>
                              <AlertTriangle className="h-8 w-8 text-yellow-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-figuro-darker/50 border-white/10">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-white/70">Status</p>
                                <Badge className={getStatusColor(securityHealth.status)}>
                                  {securityHealth.status}
                                </Badge>
                              </div>
                              <Shield className="h-8 w-8 text-white/70" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Enhanced RLS Audit Tab */}
                <TabsContent value="rls-audit" className="space-y-6">
                  <EnhancedRLSAuditDashboard />
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RLSPerformanceMonitor />
                    
                    {/* Performance Metrics */}
                    <Card className="bg-figuro-darker/50 border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Activity className="w-5 h-5" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">RLS Optimization</span>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Zap className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Performance Monitoring</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Enabled
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Last Check</span>
                          <span className="text-white/70">
                            {new Date(securityHealth?.timestamp || new Date()).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
        
        <Footer />
      </div>
    </OptimizedSecurityWrapper>
  );
};

export default SecurityDashboard;
