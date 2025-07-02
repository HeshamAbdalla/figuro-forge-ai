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
      
      {/* 3D Showcase as Foreground Element */}
      <Floating3DShowcase />
      
      {/* Main Content with proper z-index layering */}
      <div className="min-h-screen bg-figuro-dark relative" style={{ zIndex: 10 }}>
        {/* Header with enhanced backdrop */}
        <div className="relative">
          <div className="absolute inset-0 bg-figuro-dark/40 backdrop-blur-sm" />
          <div className="relative z-20">
            <Header />
          </div>
        </div>
        
        {/* Hero Section with enhanced backdrop */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-figuro-dark/60 via-figuro-dark/80 to-figuro-dark backdrop-blur-sm" />
          <div className="relative z-20">
            <Hero />
          </div>
        </div>
        
        {/* Rest of the content with solid background to ensure readability */}
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
