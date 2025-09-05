'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Check,
  Zap,
  Crown,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "Forever",
    description: "Perfect for beginners exploring automated arbitrage",
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    popular: false,
    features: [
      "1 Trading Bot",
      "Basic Arbitrage Strategy",
      "Real-time Opportunities",
      "Email Notifications",
      "$1,000 Trading Limit",
      "Community Support",
      "Mobile App Access",
      "Basic Analytics"
    ],
    limitations: [
      "Limited to Ethereum & Polygon",
      "Standard execution speed",
      "Basic risk management"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Advanced features for serious traders",
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/40",
    popular: true,
    features: [
      "5 Trading Bots",
      "All Trading Strategies",
      "Priority Execution",
      "Advanced Analytics",
      "$25,000 Trading Limit",
      "Multi-chain Support",
      "Custom Parameters",
      "Priority Support",
      "MEV Protection",
      "API Access"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "Maximum performance for professional traders",
    icon: Rocket,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    popular: false,
    features: [
      "Unlimited Trading Bots",
      "Custom Strategies",
      "Instant Execution",
      "Advanced Risk Management",
      "Unlimited Trading",
      "All Chains Supported",
      "White-label Options",
      "Dedicated Support",
      "Custom Integrations",
      "Advanced API",
      "Portfolio Management",
      "Institutional Features"
    ],
    limitations: []
  }
];

interface PricingProps {
  onSelectPlan: (planName: string) => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  return (
    <section className="py-24 bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-6 py-2 mb-6">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Flexible Pricing</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {" "}Trading Plan
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime. All plans include our core arbitrage features.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-black px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`${plan.bgColor} border-2 ${plan.borderColor} backdrop-blur-sm ${plan.popular ? 'scale-105 shadow-2xl shadow-yellow-400/20' : ''} hover:scale-105 transition-all duration-300 group h-full`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 ${plan.bgColor} border ${plan.borderColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <plan.icon className={`w-8 h-8 ${plan.color}`} />
                    </div>
                    
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </CardTitle>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-white">
                          {plan.price}
                        </span>
                        {plan.price !== "Free" && (
                          <span className="text-gray-400 text-sm">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      {plan.price === "Free" && (
                        <span className="text-gray-400 text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm">
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => onSelectPlan(plan.name)}
                      className={`w-full mb-6 ${
                        plan.popular 
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white text-sm">Included:</h4>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3 text-sm">
                          <Check className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-400 text-sm mt-6">Limitations:</h4>
                          {plan.limitations.map((limitation, limitIndex) => (
                            <div key={limitIndex} className="flex items-start gap-3 text-sm">
                              <div className="w-4 h-4 border border-gray-500 rounded-full flex-shrink-0 mt-0.5" />
                              <span className="text-gray-400">{limitation}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-white mb-2">Is there a setup fee?</h4>
                  <p className="text-gray-300 text-sm">
                    No setup fees. Start with our free plan and upgrade anytime.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Can I cancel anytime?</h4>
                  <p className="text-gray-300 text-sm">
                    Yes, cancel anytime with no questions asked. No long-term contracts.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">How are profits calculated?</h4>
                  <p className="text-gray-300 text-sm">
                    We take a small percentage only from successful trades. No profits, no fees.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Is my funds safe?</h4>
                  <p className="text-gray-300 text-sm">
                    Your funds never leave your wallet. We only execute trades you approve.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}