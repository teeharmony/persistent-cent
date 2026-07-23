import Hero from "./components/Hero";
import About from "./components/About";
import Tokenomics from "./components/Tokenomics";
import PresaleWidget from "./components/PresaleWidget";
import Roadmap from "./components/Roadmap";
import Team from "./components/Team";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      <Hero />
      <About />
      <Tokenomics />
      <PresaleWidget />
      <Roadmap />
      <Team />
      <FAQ />
      <Footer />
    </main>
  );
}
