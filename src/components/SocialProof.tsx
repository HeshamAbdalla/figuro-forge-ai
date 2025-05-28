
import { motion } from "framer-motion";
import { Star, Users, Heart, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "50K+",
    label: "Happy Creators",
    color: "text-blue-400"
  },
  {
    icon: Zap,
    number: "500K+",
    label: "Figurines Created",
    color: "text-figuro-accent"
  },
  {
    icon: Heart,
    number: "99%",
    label: "Satisfaction Rate",
    color: "text-red-400"
  },
  {
    icon: Star,
    number: "4.9/5",
    label: "User Rating",
    color: "text-yellow-400"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Game Designer",
    content: "Figuro.AI has revolutionized how I create character prototypes. What used to take weeks now takes minutes!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face"
  },
  {
    name: "Michael Torres",
    role: "Hobbyist",
    content: "I've created over 20 figurines for my D&D campaigns. The quality and detail are absolutely incredible.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
  },
  {
    name: "Emma Wilson",
    role: "Teacher",
    content: "My students love creating figurines for their stories. It's made learning so much more engaging and fun!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
  }
];

const SocialProof = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-4 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-white/70 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Loved by Creators Worldwide
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied users who have brought their imagination to life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="glass-panel p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-white/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-white/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
