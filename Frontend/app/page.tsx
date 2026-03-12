import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import FeaturedCategories from './components/FeaturedCategories';
import FlashSaleSection from './components/FlashSaleSection';
import FeaturedProducts from './components/FeaturedProducts';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FlashSaleSection />
        <FeaturedProducts />
      </main>
      <Footer />
    </>
  );
}
