import Nav from "../components/layout/Nav.tsx";
import Hero from "../components/landing/Hero.tsx";
import Features from "../components/landing/Features.tsx";
import HighlightOCR from "../components/landing/HighlightOCR.tsx";
import HighlightSettlement from "../components/landing/HighlightSettlement.tsx";
import Testimonials from "../components/landing/Testimonials.tsx";
import Pricing from "../components/landing/Pricing.tsx";
import FAQ from "../components/landing/FAQ.tsx";
import CTABanner from "../components/landing/CTABanner.tsx";
import Footer from "../components/landing/Footer.tsx";
import LogosBar from "../components/landing/LogosBar.tsx";

export default function Home() {
  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="bg-white text-slate-900"
    >
      <Nav />
      <Hero />
      <LogosBar />
      <Features />
      <HighlightOCR />
      <HighlightSettlement />
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
