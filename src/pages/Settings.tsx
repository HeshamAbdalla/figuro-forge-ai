
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Bell, Palette, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

const Settings = () => {
  const { user, profile, isLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsiveLayout();
  
  useEffect(() => {
    // If authentication is complete (not loading) and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);
  
  // If still loading or no user, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className={`container mx-auto flex justify-center items-center ${
          isMobile ? 'pt-24 pb-16 px-4' : 'pt-32 pb-24 px-4'
        }`}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className={`animate-spin text-figuro-accent ${
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            }`} />
            <p className={`text-white/70 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Loading settings...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabsConfig = [
    {
      value: "account",
      label: "Account",
      icon: User,
      mobileLabel: "Account"
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: Bell,
      mobileLabel: "Alerts"
    },
    {
      value: "appearance",
      label: "Appearance",
      icon: Palette,
      mobileLabel: "Theme"
    }
  ];

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className={isMobile ? 'pt-20 pb-16' : 'pt-32 pb-24'}>
        <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={isMobile ? 'max-w-full' : 'max-w-4xl mx-auto'}
          >
            {/* Mobile-optimized header */}
            <div className={isMobile ? 'mb-6' : 'mb-10'}>
              <h1 className={`font-bold text-white mb-2 ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                Settings
              </h1>
              <p className={`text-white/70 ${
                isMobile ? 'text-sm leading-relaxed' : 'text-base'
              }`}>
                Manage your account preferences and settings
              </p>
            </div>
            
            <Tabs defaultValue="account" className="w-full">
              {/* Enhanced mobile-first tab navigation */}
              <TabsList className={`grid grid-cols-3 w-full mb-8 ${
                isMobile ? 'h-12 p-1' : 'max-w-[600px] h-10 p-1'
              } bg-figuro-darker/50 border border-white/10`}>
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`relative transition-all duration-200 ${
                        isMobile 
                          ? 'flex-col gap-1 px-2 py-2 text-xs data-[state=active]:bg-figuro-accent data-[state=active]:text-white text-white/70'
                          : 'flex-row gap-2 px-4 py-2 text-sm data-[state=active]:bg-figuro-accent data-[state=active]:text-white text-white/70'
                      }`}
                    >
                      <Icon className={isMobile ? 'w-4 h-4' : 'w-4 h-4'} />
                      <span className="font-medium whitespace-nowrap">
                        {isMobile ? tab.mobileLabel : tab.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Enhanced tab content with mobile-optimized spacing */}
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                <TabsContent value="account" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={isMobile ? 'space-y-4' : 'space-y-8'}
                  >
                    {/* Account Information Card */}
                    <Card className="bg-figuro-darker/50 border-white/10 transition-all duration-200 hover:border-white/20">
                      <CardContent className={isMobile ? 'pt-4 p-4' : 'pt-6 p-6'}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className={`font-semibold text-white ${
                            isMobile ? 'text-lg' : 'text-xl'
                          }`}>
                            Account Information
                          </h2>
                          {isMobile && <SettingsIcon className="w-5 h-5 text-white/40" />}
                        </div>
                        
                        <div className={isMobile ? 'space-y-4' : 'space-y-4'}>
                          <div className={isMobile ? 'space-y-2' : 'space-y-1'}>
                            <p className={`font-medium text-white/70 ${
                              isMobile ? 'text-sm' : 'text-sm'
                            }`}>
                              Email
                            </p>
                            <p className={`text-white break-all ${
                              isMobile ? 'text-sm' : 'text-base'
                            }`}>
                              {user?.email}
                            </p>
                          </div>
                          
                          <div className={isMobile ? 'space-y-3' : 'space-y-2'}>
                            <p className={`font-medium text-white/70 ${
                              isMobile ? 'text-sm' : 'text-sm'
                            }`}>
                              Current Plan
                            </p>
                            <div className="flex flex-col gap-3">
                              <p className={`text-white ${
                                isMobile ? 'text-sm' : 'text-base'
                              }`}>
                                {profile?.plan || "Free"}
                              </p>
                              
                              <Button 
                                variant="outline" 
                                className={`self-start transition-all duration-200 ${
                                  isMobile 
                                    ? 'text-sm px-4 py-2 h-9 w-full' 
                                    : 'text-sm px-4 py-2'
                                } border-white/20 hover:border-figuro-accent/50 hover:bg-white/5`}
                                onClick={() => navigate("/subscription")}
                              >
                                <div className="flex items-center justify-between w-full">
                                  Manage Subscription
                                  {isMobile && <ChevronRight className="w-4 h-4" />}
                                </div>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Password Card */}
                    <Card className="bg-figuro-darker/50 border-white/10 transition-all duration-200 hover:border-white/20">
                      <CardContent className={isMobile ? 'pt-4 p-4' : 'pt-6 p-6'}>
                        <h2 className={`font-semibold text-white mb-4 ${
                          isMobile ? 'text-lg' : 'text-xl'
                        }`}>
                          Password
                        </h2>
                        <Button 
                          variant="outline"
                          className={`transition-all duration-200 ${
                            isMobile 
                              ? 'w-full text-sm px-4 py-2' 
                              : 'text-sm px-4 py-2'
                          } border-white/20 hover:border-figuro-accent/50 hover:bg-white/5`}
                          onClick={() => {
                            toast({
                              title: "Password reset email sent",
                              description: "Please check your email to reset your password.",
                            });
                          }}
                        >
                          Reset Password
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Danger Zone Card */}
                    <Card className="bg-figuro-darker/50 border-red-500/20 transition-all duration-200 hover:border-red-500/30">
                      <CardContent className={isMobile ? 'pt-4 p-4' : 'pt-6 p-6'}>
                        <h2 className={`font-semibold text-white mb-4 ${
                          isMobile ? 'text-lg' : 'text-xl'
                        }`}>
                          Danger Zone
                        </h2>
                        <Button 
                          variant="destructive"
                          className={`transition-all duration-200 ${
                            isMobile ? 'w-full text-sm px-4 py-2' : 'text-sm px-4 py-2'
                          }`}
                          onClick={() => {
                            toast({
                              title: "Account cannot be deleted",
                              description: "Please contact support to delete your account.",
                              variant: "destructive",
                            });
                          }}
                        >
                          Delete Account
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <Card className="bg-figuro-darker/50 border-white/10 transition-all duration-200 hover:border-white/20">
                    <CardContent className={isMobile ? 'pt-4 p-4' : 'pt-6 p-6'}>
                      <h2 className={`font-semibold text-white mb-4 ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }`}>
                        Email Notifications
                      </h2>
                      <div className={isMobile ? 'space-y-6' : 'space-y-4'}>
                        <div className={`flex items-center justify-between ${
                          isMobile ? 'py-2' : 'space-x-2'
                        }`}>
                          <div className="flex-1">
                            <Label htmlFor="marketing-emails" className={`text-white cursor-pointer ${
                              isMobile ? 'text-sm font-medium' : 'text-base'
                            }`}>
                              Marketing emails
                            </Label>
                            {isMobile && (
                              <p className="text-xs text-white/60 mt-1">
                                Receive updates about new features
                              </p>
                            )}
                          </div>
                          <Switch id="marketing-emails" className="ml-4" />
                        </div>
                        
                        <div className={`flex items-center justify-between ${
                          isMobile ? 'py-2' : 'space-x-2'
                        }`}>
                          <div className="flex-1">
                            <Label htmlFor="account-updates" className={`text-white cursor-pointer ${
                              isMobile ? 'text-sm font-medium' : 'text-base'
                            }`}>
                              Account updates
                            </Label>
                            {isMobile && (
                              <p className="text-xs text-white/60 mt-1">
                                Important account notifications
                              </p>
                            )}
                          </div>
                          <Switch id="account-updates" defaultChecked className="ml-4" />
                        </div>
                        
                        <div className={`flex items-center justify-between ${
                          isMobile ? 'py-2' : 'space-x-2'
                        }`}>
                          <div className="flex-1">
                            <Label htmlFor="figurine-complete" className={`text-white cursor-pointer ${
                              isMobile ? 'text-sm font-medium' : 'text-base'
                            }`}>
                              Figurine generation complete
                            </Label>
                            {isMobile && (
                              <p className="text-xs text-white/60 mt-1">
                                When your 3D models are ready
                              </p>
                            )}
                          </div>
                          <Switch id="figurine-complete" defaultChecked className="ml-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appearance" className="mt-0">
                  <Card className="bg-figuro-darker/50 border-white/10 transition-all duration-200 hover:border-white/20">
                    <CardContent className={isMobile ? 'pt-4 p-4' : 'pt-6 p-6'}>
                      <h2 className={`font-semibold text-white mb-4 ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }`}>
                        Theme
                      </h2>
                      <div className={isMobile ? 'space-y-6' : 'space-y-4'}>
                        <div className={`flex items-center justify-between ${
                          isMobile ? 'py-2' : 'space-x-2'
                        }`}>
                          <div className="flex-1">
                            <Label htmlFor="dark-mode" className={`text-white cursor-pointer ${
                              isMobile ? 'text-sm font-medium' : 'text-base'
                            }`}>
                              Dark mode
                            </Label>
                            {isMobile && (
                              <p className="text-xs text-white/60 mt-1">
                                Currently active
                              </p>
                            )}
                          </div>
                          <Switch id="dark-mode" defaultChecked disabled className="ml-4" />
                        </div>
                        
                        <p className={`text-white/50 ${
                          isMobile ? 'text-xs leading-relaxed' : 'text-sm'
                        }`}>
                          Light mode coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Settings;
