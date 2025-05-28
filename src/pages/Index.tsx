
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VantaBackground from "@/components/VantaBackground";
import HomepageGallery from "@/components/HomepageGallery";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import PricingCTA from "@/components/PricingCTA";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <SEO 
        title={pageSEO.home.title}
        description={pageSEO.home.description}
        keywords={pageSEO.home.keywords}
        ogType={pageSEO.home.ogType}
      />
      <VantaBackground>
        <div className="min-h-screen bg-transparent">
          <Header />
          <Hero />
          <HowItWorks />
          <HomepageGallery />
          <SocialProof />
          <Features />
          <PricingCTA />
          <Footer />
        </div>
      </VantaBackground>
    </>
  );
};

export default Index;
