import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problema from "@/components/landing/Problema";
import QueEs from "@/components/landing/QueEs";
import MockupClienta from "@/components/landing/MockupClienta";
import Proceso from "@/components/landing/Proceso";
import Planes from "@/components/landing/Planes";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Navbar />
      <Hero />
      <Problema />
      <QueEs />
      <MockupClienta />
      <Proceso />
      <Planes />
      <FAQ />
      <Footer />
    </main>
  );
};

export default Landing;
