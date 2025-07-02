
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
      
      {/* Main container with simplified layout */}
      <div className="min-h-screen bg-figuro-dark flex flex-col">
        {/* Header at the top */}
        <Header />
        
        {/* 3D Canvas filling the remaining space */}
        <div className="flex-1">
          <Floating3DShowcase />
        </div>
      </div>
    </>
  );
};

export default Index;
