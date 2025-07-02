
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
      
      {/* 3D Showcase as Background Layer */}
      <Floating3DShowcase />
      
      {/* Main Content with higher z-index to appear over background */}
      <div className="min-h-screen bg-figuro-dark/95 relative" style={{ zIndex: 10 }}>
        {/* Header without heavy backdrop */}
        <div className="relative">
          <Header />
        </div>
        
        {/* Hero Section with subtle backdrop */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-figuro-dark/30 via-figuro-dark/50 to-figuro-dark/70" />
          <div className="relative z-20">
            <Hero />
          </div>
        </div>
        
        {/* Content sections with solid background for readability */}
        <div className="relative z-20 bg-figuro-dark">
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
