
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
      
      {/* Main Content with reduced opacity to show 3D background */}
      <div className="min-h-screen bg-figuro-dark/60 relative" style={{ zIndex: 10 }}>
        {/* Header with minimal backdrop */}
        <div className="relative">
          <Header />
        </div>
        
        {/* Hero Section with lighter backdrop */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-figuro-dark/20 via-figuro-dark/30 to-figuro-dark/40" />
          <div className="relative z-20">
            <Hero />
          </div>
        </div>
        
        {/* Content sections with strategic semi-transparent backgrounds */}
        <div className="relative z-20">
          <div className="bg-figuro-dark/80">
            <FreeTierSpotlight />
          </div>
          <div className="bg-figuro-dark/70">
            <InteractiveDemo />
          </div>
          <div className="bg-figuro-dark/80">
            <HomepageGallery />
          </div>
          <div className="bg-figuro-dark/70">
            <UseCaseExamples />
          </div>
          <div className="bg-figuro-dark/80">
            <Features />
          </div>
          <div className="bg-figuro-dark/90">
            <PricingCTA />
          </div>
          <div className="bg-figuro-dark">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
