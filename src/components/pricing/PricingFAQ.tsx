
import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const PricingFAQ = () => {
  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "What happens if I exceed my usage limits?",
      answer: "We'll notify you when you're approaching your limits. You can either upgrade your plan or wait for your limits to reset in the next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
    },
    {
      question: "Can I use generated models commercially?",
      answer: "Professional and Enterprise plans include commercial licensing. Free and Starter plans are for personal use only."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe payment processor."
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "All new users start with our free plan to explore the platform. You can upgrade anytime to access premium features."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-6">
              <HelpCircle size={32} className="text-figuro-accent" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/70">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="glass-panel p-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-white/10 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="text-white hover:text-figuro-accent px-6 py-4 hover:no-underline">
                    <span className="text-left font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-white/80 px-6 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingFAQ;
