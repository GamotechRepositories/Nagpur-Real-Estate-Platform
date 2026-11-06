import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSearch from './HeroSearch';
import FeaturedProperties from './FeaturedProperties';
import LocalityShowcase from './LocalityShowcase';
import VerifiedProperties from './VerifiedProperties';
import EmiCalculatorPreview from './EmiCalculatorPreview';
import AgentShowcase from './AgentShowcase';
import WhyChooseUs from './WhyChooseUs';
import AuthModal from '../../components/common/AuthModal';

const HomePage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Nagpur Real Estate — Buy, Rent Flats, Plots & Villas in Nagpur</title>
        <meta
          name="description"
          content="Find verified flats, plots, and commercial properties in Nagpur. Explore Dharampeth, Manish Nagar, Wardha Road, Besa, Civil Lines and prime areas with MahaRERA verification."
        />
        <link rel="canonical" href="https://nagpurestate.com/" />
      </Helmet>

      <div>
        {/* 1. Hero Search */}
        <HeroSearch />

        {/* 2. Featured Properties */}
        <FeaturedProperties onOpenAuth={() => setAuthModalOpen(true)} />

        {/* 3. Locality Showcase */}
        <LocalityShowcase />

        {/* 4. Verified Properties */}
        <VerifiedProperties onOpenAuth={() => setAuthModalOpen(true)} />

        {/* 5. EMI Calculator Preview */}
        <EmiCalculatorPreview />

        {/* 6. Popular Agents */}
        <AgentShowcase />

        {/* 7. Why Choose Nagpur Real Estate */}
        <WhyChooseUs />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default HomePage;
