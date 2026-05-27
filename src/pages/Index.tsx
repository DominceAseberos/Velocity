import VelocityWallHero from "@/components/VelocityWallHero";
import BrandPhilosophy from "@/components/BrandPhilosophy";
import FeaturedCollection from "@/components/FeaturedCollection";
import CinematicStrip from "@/components/CinematicStrip";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import BrandMarquee from "@/components/BrandMarquee";
import NewsletterCTA from "@/components/NewsletterCTA";
import VeloceFooter from "@/components/VeloceFooter";

const Index = () => {
  return (
    <div className="velocity-app">
      <header role="banner">
        <VelocityWallHero />
      </header>
      <main id="main-content" role="main">
        <BrandPhilosophy />
        <FeaturedCollection />
        <CinematicStrip />
        <HowItWorks />
        <Testimonials />
        <BrandMarquee />
        <NewsletterCTA />
      </main>
      <VeloceFooter />
    </div>
  );
};

export default Index;
