
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using Figuros.AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "2. Description of Service",
      content: `Figuros.AI provides AI-powered 3D figurine generation services that convert text prompts into downloadable 3D models. The service includes various features such as art style selection, model customization, and file format options.`
    },
    {
      title: "3. User Accounts",
      content: `To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.`
    },
    {
      title: "4. Acceptable Use",
      content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
      • Generate content that is illegal, harmful, threatening, abusive, or defamatory
      • Create models that infringe on intellectual property rights of others
      • Attempt to reverse engineer or exploit the Service
      • Use the Service for any commercial purpose without proper licensing
      • Upload malicious content or attempt to disrupt the Service`
    },
    {
      title: "5. Intellectual Property Rights",
      content: `The Service and its original content, features, and functionality are owned by Figuros.AI and are protected by international copyright, trademark, and other intellectual property laws. Users retain rights to their generated content according to their subscription plan, but may not claim ownership of the underlying AI technology.`
    },
    {
      title: "6. User-Generated Content",
      content: `You retain ownership of the text prompts you submit and the resulting 3D models generated through our Service, subject to the rights granted to us in these Terms. You grant us a non-exclusive license to use your content for the purpose of providing and improving the Service.`
    },
    {
      title: "7. Subscription and Billing",
      content: `Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as specifically stated in our refund policy. We reserve the right to change our pricing with 30 days' notice to existing subscribers.`
    },
    {
      title: "8. Service Availability",
      content: `We strive to maintain high service availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not liable for any interruption of service.`
    },
    {
      title: "9. Privacy Policy",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      title: "10. Limitation of Liability",
      content: `To the fullest extent permitted by law, Figuros.AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.`
    },
    {
      title: "11. Indemnification",
      content: `You agree to defend, indemnify, and hold harmless Figuros.AI and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).`
    },
    {
      title: "12. Termination",
      content: `We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.`
    },
    {
      title: "13. Governing Law",
      content: `These Terms shall be interpreted and governed by the laws of the State of California, United States, without regard to conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in San Francisco, California.`
    },
    {
      title: "14. Changes to Terms",
      content: `We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.`
    },
    {
      title: "15. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at legal@figuros.ai or through our contact form on the website.`
    }
  ];

  return (
    <>
      <SEO 
        title={pageSEO.terms.title}
        description={pageSEO.terms.description}
        keywords={pageSEO.terms.keywords}
        ogType={pageSEO.terms.ogType}
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
                  Terms of <span className="text-figuro-accent">Service</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Please read these Terms of Service carefully before using Figuros.AI. 
                  These terms govern your use of our service and explain your rights and responsibilities.
                </p>
                <p className="text-sm text-white/60">
                  Last updated: January 1, 2025
                </p>
              </motion.div>
            </div>
          </section>

          {/* Terms Content */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <Card className="bg-figuro-darker border-white/10">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Agreement Overview</h2>
                      <p className="text-white/80 leading-relaxed">
                        These Terms of Service ("Terms") govern your access to and use of the Figuros.AI website, 
                        mobile application, and related services (collectively, the "Service") operated by Figuros.AI 
                        ("we," "us," or "our"). By using our Service, you agree to be bound by these Terms.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="space-y-8">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Card className="bg-figuro-darker border-white/10">
                        <CardContent className="p-8">
                          <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                          <div className="text-white/80 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Contact Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mt-16"
                >
                  <Card className="bg-figuro-darker border-white/10">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-bold text-white mb-4">Questions About These Terms?</h3>
                      <p className="text-white/80 mb-6">
                        If you have any questions about these Terms of Service, please don't hesitate to contact us.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                          href="mailto:legal@figuros.ai"
                          className="text-figuro-accent hover:text-figuro-accent-hover transition-colors"
                        >
                          legal@figuros.ai
                        </a>
                        <span className="hidden sm:inline text-white/40">•</span>
                        <a 
                          href="/contact"
                          className="text-figuro-accent hover:text-figuro-accent-hover transition-colors"
                        >
                          Contact Form
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
