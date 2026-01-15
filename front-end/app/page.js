import Header from './components/common/Header';
import Hero from './components/common/Hero';
import Stats from './components/common/Stats';
import Features from './components/common/Features';
import HowItWorks from './components/common/HowItWorks';
import Pricing from './components/common/Pricing';
import CTA from './components/common/CTA';
import Footer from './components/common/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
