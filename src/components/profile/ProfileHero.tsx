
import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Shield, Calendar, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeroProps {
  user: any;
  profile: any;
  onDataRefresh: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ user, profile, onDataRefresh }) => {
  const navigate = useNavigate();

  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map(name => name[0]).join("").toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "FG";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get plan badge color and icon
  const getPlanInfo = () => {
    const plan = profile?.plan || 'free';
    switch (plan) {
      case 'admin':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Shield };
      case 'pro':
        return { color: 'bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30', icon: Crown };
      case 'premium':
        return { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Sparkles };
      default:
        return { color: 'bg-white/10 text-white/80 border-white/20', icon: User };
    }
  };

  const planInfo = getPlanInfo();
  const PlanIcon = planInfo.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-figuro-dark via-gray-900 to-purple-900/20 py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
            {/* Enhanced Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-figuro-accent via-purple-500 to-figuro-accent rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <Avatar className="relative h-32 w-32 border-4 border-white/20 shadow-glow">
                <AvatarImage 
                  src={profile?.avatar_url || `https://www.gravatar.com/avatar/${user?.email ? user.email.trim().toLowerCase() : ''}?d=mp&s=256`} 
                  alt={profile?.full_name || user?.email || "User"} 
                />
                <AvatarFallback className="bg-figuro-accent text-white text-4xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            {/* Profile Information */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-white via-figuro-accent to-purple-400 bg-clip-text text-transparent mb-2">
                  {profile?.full_name || user?.email}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <Badge className={`glass-panel px-3 py-1 text-sm font-medium ${planInfo.color}`}>
                    <PlanIcon className="w-4 h-4 mr-2" />
                    {(profile?.plan || 'free').charAt(0).toUpperCase() + (profile?.plan || 'free').slice(1)} Plan
                  </Badge>
                  
                  <Badge className="glass-panel px-3 py-1 text-sm font-medium bg-white/10 text-white/80 border-white/20">
                    <Calendar className="w-4 h-4 mr-2" />
                    Since {formatDate(user?.created_at || "")}
                  </Badge>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 mb-6">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center md:justify-start gap-3"
              >
                <Button 
                  onClick={() => navigate("/profile/pictures")}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-glow"
                >
                  <User className="w-4 h-4 mr-2" />
                  Manage Avatar
                </Button>
                
                <Button 
                  onClick={() => navigate("/profile/figurines")}
                  variant="outline"
                  className="glass-panel border-white/20 text-white hover:bg-white/10 hover:border-figuro-accent/50 px-6 py-2 rounded-xl transition-all duration-300"
                >
                  My Figurines
                </Button>
                
                <Button 
                  onClick={onDataRefresh}
                  variant="outline"
                  className="glass-panel border-white/20 text-white hover:bg-white/10 hover:border-figuro-accent/50 px-6 py-2 rounded-xl transition-all duration-300"
                >
                  Refresh Data
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfileHero;
