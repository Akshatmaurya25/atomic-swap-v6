'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  TrendingUp, 
  Zap, 
  Shield, 
  ArrowRight,
  Play,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGetStarted: () => void;
  onWatchDemo?: () => void;
}

export function Hero({ onGetStarted, onWatchDemo }: HeroProps) {
  const { isAuthenticated, authLoading } = useApp();
  const router = useRouter();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 mt-14 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-6 py-2 mb-8">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Powered by Yellow Network</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Automated
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {" "}Arbitrage{" "}
                </span>
                Trading
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover profitable cross-chain arbitrage opportunities and deploy intelligent trading bots that work 24/7 to maximize your DeFi returns.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              {!authLoading && isAuthenticated ? (
                <>
                  <Button 
                    onClick={handleDashboardClick}
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/bots')}
                    variant="outline" 
                    size="lg"
                    className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Manage Bots
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  {onWatchDemo && (
                    <Button 
                      onClick={onWatchDemo}
                      variant="outline" 
                      size="lg"
                      className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </Button>
                  )}
                </>
              )}
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">$2.4M+</h3>
                <p className="text-gray-400">Total Value Traded</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">1,247</h3>
                <p className="text-gray-400">Active Trading Bots</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="text-center py-8">
                <div className="w-12 h-12 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">99.9%</h3>
                <p className="text-gray-400">Uptime Guarantee</p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={scrollToFeatures}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-8 h-8 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}