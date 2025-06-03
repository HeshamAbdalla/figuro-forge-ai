
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Heart, Download, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatorSpotlight = () => {
  const navigate = useNavigate();

  const featuredCreators = [
    {
      name: "Alex Chen",
      username: "@alexcreates",
      avatar: "/placeholder.svg",
      specialty: "Fantasy Characters",
      creations: 127,
      likes: 2400,
      featured: {
        title: "Mystic Dragon Knight",
        description: "A powerful dragon warrior with crystalline armor",
        image: "/placeholder.svg",
        downloads: 340
      }
    },
    {
      name: "Maya Rodriguez", 
      username: "@mayaart",
      avatar: "/placeholder.svg",
      specialty: "Cute Animals",
      creations: 89,
      likes: 1800,
      featured: {
        title: "Space Cat Explorer",
        description: "An adorable cat in a tiny astronaut suit",
        image: "/placeholder.svg", 
        downloads: 520
      }
    },
    {
      name: "David Kim",
      username: "@davidbuilds",
      avatar: "/placeholder.svg",
      specialty: "Steampunk",
      creations: 156,
      likes: 3200,
      featured: {
        title: "Clockwork Inventor",
        description: "Victorian-era inventor with mechanical gadgets",
        image: "/placeholder.svg",
        downloads: 680
      }
    }
  ];

  const communityStats = [
    { label: "Active Creators", value: "12,000+", icon: Users },
    { label: "Total Creations", value: "500K+", icon: Star },
    { label: "Downloads", value: "2M+", icon: Download },
    { label: "Community Likes", value: "8M+", icon: Heart }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-figuro-accent/5 to-pink-500/5" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">Creator Spotlight</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Amazing Creators,{" "}
            <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Incredible Art
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Discover the talented creators in our community and the stunning figurines they've brought to life.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {communityStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                <stat.icon className="w-8 h-8 text-figuro-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Creators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredCreators.map((creator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-figuro-accent/30 transition-colors duration-300">
                <div className="relative">
                  {/* Featured Creation Image */}
                  <div className="aspect-square bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 relative overflow-hidden">
                    <img 
                      src={creator.featured.image} 
                      alt={creator.featured.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Creator Avatar */}
                  <div className="absolute -bottom-6 left-6">
                    <Avatar className="w-12 h-12 border-2 border-white/20">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <CardContent className="p-6 pt-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{creator.name}</h3>
                    <p className="text-figuro-accent text-sm mb-2">{creator.username}</p>
                    <p className="text-white/60 text-sm">{creator.specialty} Specialist</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-1">{creator.featured.title}</h4>
                    <p className="text-white/70 text-sm mb-3">{creator.featured.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {creator.creations}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {creator.likes}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {creator.featured.downloads}
                    </span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-white/20 text-white/80 hover:border-figuro-accent/50 hover:text-white"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Join Our Creative Community?
            </h3>
            <p className="text-white/70 mb-6">
              Start creating your own amazing figurines and share them with thousands of fellow creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/studio')}
                size="lg"
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white font-semibold group"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate('/gallery')}
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Explore Gallery
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorSpotlight;
