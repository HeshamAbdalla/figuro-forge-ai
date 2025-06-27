
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Indie Game Developer",
    company: "Pixel Dreams Studio",
    avatar: "/placeholder.svg",
    quote: "Figuros.AI transformed my development process. I can now create professional game assets in minutes instead of spending days on each character. It's like having an entire art team at my fingertips.",
    rating: 5,
    project: "Fantasy Adventure RPG"
  },
  {
    name: "Marcus Rodriguez",
    role: "Lead 3D Artist",
    company: "Creative Vision Ltd",
    avatar: "/placeholder.svg", 
    quote: "The quality of 3D models generated is incredible. We use Figuros.AI for rapid prototyping and it has cut our concept-to-model time by 80%. Our clients love the quick turnaround.",
    rating: 5,
    project: "AR Shopping Experience"
  },
  {
    name: "Emma Thompson",
    role: "Content Creator",
    company: "YouTube - 2M subscribers",
    avatar: "/placeholder.svg",
    quote: "As a content creator, I need unique visuals constantly. Figuros.AI helps me create custom thumbnails and character designs that make my content stand out. My engagement has increased by 40%!",
    rating: 5,
    project: "Gaming YouTube Channel"
  },
  {
    name: "David Park",
    role: "Startup Founder",
    company: "VR Experiences Inc",
    avatar: "/placeholder.svg",
    quote: "Building our VR app prototype would have cost us $50k+ in freelancer fees. With Figuros.AI, we created all our initial assets for a fraction of the cost and launched 3 months earlier.",
    rating: 5,
    project: "VR Training Platform"
  }
];

const showcaseItems = [
  {
    title: "Medieval Fantasy Characters",
    description: "Complete character set for RPG game",
    stats: "Generated in 2 hours • Used by 15K+ players",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Sci-Fi Environment Assets",
    description: "Futuristic building and prop collection",
    stats: "50+ unique models • 90% faster than traditional modeling",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Cartoon Animal Collection", 
    description: "Stylized characters for mobile game",
    stats: "Featured in App Store • 1M+ downloads",
    gradient: "from-green-500/20 to-emerald-500/20"
  }
];

export const SuccessStories = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-figuro-dark/50 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            See how creators around the world are using Figuros.AI to bring their visions to life 
            and accelerate their creative workflows.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="glass-panel h-full p-8 relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 via-purple-500/10 to-figuro-accent/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-figuro-accent text-figuro-accent" />
                    ))}
                  </div>
                  
                  <blockquote className="text-white/90 italic mb-8 leading-relaxed text-lg">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-14 h-14 border-2 border-figuro-accent/30">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-figuro-accent/20 text-figuro-accent text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-semibold text-lg">{testimonial.name}</div>
                      <div className="text-white/70">{testimonial.role}</div>
                      <div className="text-figuro-accent text-sm font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-sm text-white/60">
                      Project: <span className="text-figuro-accent font-medium">{testimonial.project}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Featured Projects
          </h3>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Explore some amazing projects created entirely with Figuros.AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <div className="glass-panel group hover:shadow-glow-sm transition-all duration-300 overflow-hidden">
                <div className={`aspect-video bg-gradient-to-br ${item.gradient} relative overflow-hidden mb-6`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/60 text-sm bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                      Preview Coming Soon
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6">
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-white/70 mb-4 leading-relaxed">{item.description}</p>
                  <div className="text-sm text-figuro-accent font-medium">{item.stats}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
