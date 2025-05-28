
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { CoreSolutions } from "@/components/solutions/CoreSolutions";
import { TargetAudiences } from "@/components/solutions/TargetAudiences";
import { TechnicalCapabilities } from "@/components/solutions/TechnicalCapabilities";
import { SuccessStories } from "@/components/solutions/SuccessStories";
import { SolutionsCallToAction } from "@/components/solutions/SolutionsCallToAction";

const Solutions = () => {
  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <SolutionsHero />
      <CoreSolutions />
      <TargetAudiences />
      <TechnicalCapabilities />
      <SuccessStories />
      <SolutionsCallToAction />
      
      <Footer />
    </div>
  );
};

export default Solutions;
