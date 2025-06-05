
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FreeTierSpotlight from "@/components/FreeTierSpotlight";
import InteractiveDemo from "@/components/InteractiveDemo";
import HomepageGallery from "@/components/HomepageGallery";
import UseCaseExamples from "@/components/UseCaseExamples";
import Features from "@/components/Features";
import PricingCTA from "@/components/PricingCTA";
import VantaBackground from "@/components/VantaBackground";
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
          <FreeTierSpotlight />
          <InteractiveDemo />
          <HomepageGallery />
          <UseCaseExamples />
          <Features />
          <PricingCTA />
          <Footer />
        </div>
      </VantaBackground>
    </>
  );
};

export default Index;
