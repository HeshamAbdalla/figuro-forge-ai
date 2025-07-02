import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FreeTierSpotlight from "@/components/FreeTierSpotlight";
import InteractiveDemo from "@/components/InteractiveDemo";
import Floating3DShowcase from "@/components/homepage/Floating3DShowcase";
import HomepageGallery from "@/components/HomepageGallery";
import UseCaseExamples from "@/components/UseCaseExamples";
import Features from "@/components/Features";
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
      {/* Replace VantaBackground with direct 3D showcase as header background */}
      <div className="min-h-screen bg-figuro-dark relative">
        {/* 3D Showcase as Header Background */}
        <div className="absolute inset-0 z-0">
          <Floating3DShowcase />
        </div>
        
        {/* Header and Hero overlaid on 3D background */}
        <div className="relative z-10">
          <Header />
          <div className="relative">
            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-figuro-dark/20 backdrop-blur-sm" />
            <div className="relative z-10">
              <Hero />
            </div>
          </div>
        </div>
        
        {/* Rest of the content with solid background */}
        <div className="relative z-10 bg-figuro-dark">
          <FreeTierSpotlight />
          <InteractiveDemo />
          <HomepageGallery />
          <UseCaseExamples />
          <Features />
          <PricingCTA />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
