
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomepageGallery from "@/components/HomepageGallery";
import Floating3DShowcase from "@/components/homepage/Floating3DShowcase";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";

const Index = () => {
  return (
    <>
      <SEO 
        title={pageSEO.home.title}
        description={pageSEO.home.description}
        keywords={pageSEO.home.keywords}
        ogType={pageSEO.home.ogType}
      />
      
      {/* 3D Showcase as Fixed Background */}
      <Floating3DShowcase />
      
      {/* Main Content Layer */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <Header />
        
        {/* Hero Section - Full Height */}
        <Hero />
        
        {/* Gallery Section */}
        <HomepageGallery />
      </div>
    </>
  );
};

export default Index;
