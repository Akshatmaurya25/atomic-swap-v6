'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { useApp } from '@/providers/AppProvider';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Remove auto-redirect - let user decide when to go to dashboard

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSelectPlan = (planName: string) => {
    console.log('Selected plan:', planName);
    handleGetStarted();
  };

  const handleWatchDemo = () => {
    // TODO: Implement demo video modal or redirect
    console.log('Watch demo clicked');
  };

  // Show landing page for all users - authenticated users get dashboard button

  return (
    <div className="min-h-screen bg-gray-900">
      <LandingNavigation onGetStarted={handleGetStarted} />
      
      <Hero 
        onGetStarted={handleGetStarted}
        onWatchDemo={handleWatchDemo}
      />
      
      <Features />
      
      <div id="how-it-works">
        <HowItWorks />
      </div>
      
      <div id="pricing">
        <Pricing onSelectPlan={handleSelectPlan} />
      </div>
      
      <Footer onGetStarted={handleGetStarted} />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
