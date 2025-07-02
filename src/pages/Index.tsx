
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
      <div className="min-h-screen relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <Header />
        
        {/* Hero Section - Full Height */}
        <Hero />
      </div>
    </>
  );
};

export default Index;
