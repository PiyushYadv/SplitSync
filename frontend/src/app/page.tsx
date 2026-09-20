import Nav from "@/src/components/landing/Nav";
import Hero from "@/src/components/landing/Hero";
import Features from "@/src/components/landing/Features";
import HighlightOCR from "@/src/components/landing/HighlightOCR";
import HighlightSettlement from "@/src/components/landing/HighlightSettlement";
import FAQ from "@/src/components/landing/FAQ";
import CTABanner from "@/src/components/landing/CTABanner";
import Footer from "@/src/components/landing/Footer";
import LogosBar from "@/src/components/landing/LogosBar";

export default function Home() {
  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50"
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
