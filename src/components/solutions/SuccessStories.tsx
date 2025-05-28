
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
    quote: "Figuro.AI transformed my development process. I can now create professional game assets in minutes instead of spending days on each character. It's like having an entire art team at my fingertips.",
    rating: 5,
    project: "Fantasy Adventure RPG"
  },
  {
    name: "Marcus Rodriguez",
    role: "Lead 3D Artist",
    company: "Creative Vision Ltd",
    avatar: "/placeholder.svg", 
    quote: "The quality of 3D models generated is incredible. We use Figuro.AI for rapid prototyping and it has cut our concept-to-model time by 80%. Our clients love the quick turnaround.",
    rating: 5,
    project: "AR Shopping Experience"
  },
  {
    name: "Emma Thompson",
    role: "Content Creator",
    company: "YouTube - 2M subscribers",
    avatar: "/placeholder.svg",
    quote: "As a content creator, I need unique visuals constantly. Figuro.AI helps me create custom thumbnails and character designs that make my content stand out. My engagement has increased by 40%!",
    rating: 5,
    project: "Gaming YouTube Channel"
  },
  {
    name: "David Park",
    role: "Startup Founder",
    company: "VR Experiences Inc",
    avatar: "/placeholder.svg",
    quote: "Building our VR app prototype would have cost us $50k+ in freelancer fees. With Figuro.AI, we created all our initial assets for a fraction of the cost and launched 3 months earlier.",
    rating: 5,
    project: "VR Training Platform"
  }
];

const showcaseItems = [
  {
    title: "Medieval Fantasy Characters",
    description: "Complete character set for RPG game",
    stats: "Generated in 2 hours • Used by 15K+ players"
  },
  {
    title: "Sci-Fi Environment Assets",
    description: "Futuristic building and prop collection",
    stats: "50+ unique models • 90% faster than traditional modeling"
  },
  {
    title: "Cartoon Animal Collection", 
    description: "Stylized characters for mobile game",
    stats: "Featured in App Store • 1M+ downloads"
  }
];

export const SuccessStories = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Success Stories
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            See how creators around the world are using Figuro.AI to bring their visions to life 
            and accelerate their creative workflows.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="glass-panel h-full hover:shadow-glow-sm transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-figuro-accent text-figuro-accent" />
                    ))}
                  </div>
                  
                  <blockquote className="text-white/90 italic mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-figuro-accent/20 text-figuro-accent">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-white/70 text-sm">{testimonial.role}</div>
                      <div className="text-figuro-accent text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-sm text-white/60">
                      Project: <span className="text-figuro-accent">{testimonial.project}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Project Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Featured Projects
          </h3>
          <p className="text-white/70 max-w-xl mx-auto">
            Explore some amazing projects created entirely with Figuro.AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="glass-panel group hover:shadow-glow-sm transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-figuro-accent/20 to-figuro-light/20 rounded-t-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white/60 text-sm">
                    Preview Coming Soon
                  </div>
                </div>
                <CardContent className="px-6 pb-6">
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-white/70 text-sm mb-3">{item.description}</p>
                  <div className="text-xs text-figuro-accent">{item.stats}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
