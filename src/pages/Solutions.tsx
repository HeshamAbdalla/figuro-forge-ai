
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { CoreSolutions } from "@/components/solutions/CoreSolutions";
import { TargetAudiences } from "@/components/solutions/TargetAudiences";
import { TechnicalCapabilities } from "@/components/solutions/TechnicalCapabilities";
import { SuccessStories } from "@/components/solutions/SuccessStories";
import { SolutionsCallToAction } from "@/components/solutions/SolutionsCallToAction";
import SEO from "@/components/SEO";

const Solutions = () => {
  return (
    <div className="min-h-screen bg-figuro-dark">
      <SEO 
        title="Solutions - Figuros.AI"
        description="Discover how Figuros.AI transforms your creative workflow with AI-powered 3D asset generation for games, content creation, and business applications."
      />
      <Header />
      
      <main className="pt-20">
        <SolutionsHero />
        <CoreSolutions />
        <TargetAudiences />
        <TechnicalCapabilities />
        <SuccessStories />
        <SolutionsCallToAction />
      </main>
      
      <Footer />
    </div>
  );
};

export default Solutions;
