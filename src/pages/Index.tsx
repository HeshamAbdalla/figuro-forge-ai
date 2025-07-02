
import Header from "@/components/Header";
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
      
      {/* Main container with header and 3D background */}
      <div className="min-h-screen bg-figuro-dark relative">
        {/* 3D Showcase positioned behind header */}
        <div className="absolute inset-0 w-full h-full">
          <Floating3DShowcase />
        </div>
        
        {/* Header with proper z-index to appear above 3D canvas */}
        <div className="relative z-50">
          <Header />
        </div>
        
        {/* Optional content area if needed later */}
        <div className="relative z-40 flex-1">
          {/* Future content can go here */}
        </div>
      </div>
    </>
  );
};

export default Index;
