// pages/index.js
"use client"
import React, { useState } from 'react';
import Head from 'next/head';
import { motion, Variants } from 'framer-motion';

export default function Home() {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const featureVariant = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  const glowPulse: Variants = {
    initial: { 
      textShadow: "0 0 8px rgba(255, 0, 255, 0.7), 0 0 12px rgba(255, 0, 255, 0.5)" 
    },
    animate: { 
      textShadow: [
        "0 0 8px rgba(255, 0, 255, 0.7), 0 0 12px rgba(255, 0, 255, 0.5)", 
        "0 0 15px rgba(255, 0, 255, 0.9), 0 0 30px rgba(255, 0, 255, 0.7)",
        "0 0 8px rgba(255, 0, 255, 0.7), 0 0 12px rgba(255, 0, 255, 0.5)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };
  
  const gridVariant = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.5 }
    }
  };
  
  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEmailSubmitted(true);
    setTimeout(() => setIsEmailSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Head>
        <title>suregigz - Decentralized Freelancing Platform</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Grid Background */}
      <motion.div 
        className="absolute inset-0 z-0" 
        variants={gridVariant}
        initial="hidden"
        animate="visible"
        style={{
          backgroundImage: 'linear-gradient(rgba(120, 0, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(120, 0, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Animated Gradient Overlay */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle, rgba(76, 0, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            'radial-gradient(circle, rgba(255, 0, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            'radial-gradient(circle, rgba(76, 0, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)'
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-purple-700 border-opacity-50 backdrop-filter backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-['Press_Start_2P'] text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                  suregigz
                </span>
              </motion.div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <motion.a href="#features" 
                    className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Features
                  </motion.a>
                  <motion.a href="#benefits" 
                    className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Benefits
                  </motion.a>
                  <motion.a href="#join" 
                    className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    Join
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <header className="pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <motion.h1 
                className="font-['Press_Start_2P'] text-4xl sm:text-5xl md:text-6xl tracking-tight mb-8"
                variants={glowPulse}
                initial="initial"
                animate="animate"
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400">
                  suregigz
                </span>
              </motion.h1>
              
              <motion.p 
                className="font-['VT323'] text-2xl md:text-3xl mt-6 max-w-3xl mx-auto leading-relaxed text-purple-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                A decentralized freelancing platform that rebuilds trust through smart contracts, AI evaluation, and ZK-based dispute resolution.
              </motion.p>
              
              <motion.div 
                className="mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.button 
                  className="font-['Press_Start_2P'] text-sm sm:text-base px-8 py-3 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Animated Illustration */}
            <motion.div 
              className="mt-16 relative max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <div className="border-2 border-purple-500 border-opacity-50 rounded-lg overflow-hidden shadow-2xl shadow-purple-500/20">
                <div className="bg-gradient-to-r from-purple-900/70 to-pink-900/70 backdrop-filter backdrop-blur-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="font-['VT323'] text-sm text-purple-300">suregigz://freelance/smart-contract</div>
                  </div>
                  
                  <motion.div 
                    className="font-['VT323'] text-xl"
                    animate={{ opacity: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-green-400 mb-2">~ Smart Contract Created</div>
                    <div className="text-purple-300 mb-2"> Client escrow funds locked: 1.5 ETH</div>
                    <div className="text-cyan-400 mb-2"> Freelancer agreement confirmed</div>
                    <div className="text-pink-400">
                      <motion.span 
                        animate={{ opacity: [0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                      >_</motion.span>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <motion.div 
                className="absolute -top-10 -left-10 w-20 h-20 border-t-2 border-l-2 border-cyan-500 opacity-70"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute -bottom-10 -right-10 w-20 h-20 border-b-2 border-r-2 border-pink-500 opacity-70"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </header>
        
        {/* Problem Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h2 
                className="font-['Press_Start_2P'] text-2xl md:text-3xl text-red-500 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                ❌ Problem
              </motion.h2>
              <p className="font-['VT323'] text-xl md:text-2xl max-w-3xl mx-auto">
                Traditional freelancing platforms face:
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "Mismatched expectations on deliverables",
                "Unfair dispute handling",
                "Payment insecurity for freelancers",
                "Difficulty verifying professional expertise",
                "Centralized arbitration with low transparency"
              ].map((problem, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-br from-red-900/30 to-purple-900/30 border border-red-700/30 rounded-lg p-6 backdrop-filter backdrop-blur-sm"
                  variants={featureVariant}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="font-['VT323'] text-xl flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>{problem}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Solution Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h2 
                className="font-['Press_Start_2P'] text-2xl md:text-3xl text-green-400 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                ✅ Solution
              </motion.h2>
              <p className="font-['VT323'] text-xl md:text-2xl max-w-3xl mx-auto">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 font-bold">
                  suregigz
                </span> solves this with:
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">🔐</span>
                  <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">Attestation-Based Agreements</h3>
                </div>
                <p className="font-['VT323'] text-xl mt-4">
                  Smart contracts define and store job terms, ensuring transparency and accountability.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">🤖</span>
                  <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">AI-Powered Work Evaluation</h3>
                </div>
                <p className="font-['VT323'] text-xl mt-4">
                  AI compares submitted work with the job description, generating relevance scores for objective feedback.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">🧑‍⚖️</span>
                  <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">Decentralized Dispute Resolution</h3>
                </div>
                <p className="font-['VT323'] text-xl mt-4">
                  Verified validators (proven via ZKPass) and AI jointly resolve disputes with fairness and transparency.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">💸</span>
                  <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">Escrow-Backed Payments</h3>
                </div>
                <p className="font-['VT323'] text-xl mt-4">
                  Client payments are locked in escrow and released only when work is validated or disputes are resolved.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h2 
                className="font-['Press_Start_2P'] text-2xl md:text-3xl text-yellow-400 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                🌟 Benefits
              </motion.h2>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border border-yellow-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center mb-4">
                  <h3 className="font-['Press_Start_2P'] text-lg text-pink-400">For Freelancers</h3>
                </div>
                <p className="font-['VT323'] text-xl">
                  Guaranteed payments and objective evaluations, eliminating payment uncertainty.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border border-yellow-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center mb-4">
                  <h3 className="font-['Press_Start_2P'] text-lg text-pink-400">For Clients</h3>
                </div>
                <p className="font-['VT323'] text-xl">
                  Work that matches expectations with lower dispute risk and transparent processes.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border border-yellow-700/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm"
                variants={featureVariant}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center mb-4">
                  <h3 className="font-['Press_Start_2P'] text-lg text-pink-400">For Validators</h3>
                </div>
                <p className="font-['VT323'] text-xl">
                  Earn rewards for fair and reputation-based dispute resolutions within the ecosystem.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="join" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h2 
                className="font-['Press_Start_2P'] text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                Join The Revolution
              </motion.h2>
              <p className="font-['VT323'] text-xl md:text-2xl max-w-3xl mx-auto">
                Be among the first to experience the future of decentralized freelancing.
              </p>
            </motion.div>
            
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <form onSubmit={handleEmailSubmit} className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm">
                <div className="mb-4">
                  <label className="block font-['VT323'] text-xl mb-2" htmlFor="email">
                    Your Email
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full bg-black bg-opacity-50 border border-purple-500/50 rounded px-4 py-3 font-['VT323'] text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="enter@your.email"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-['VT323'] text-xl mb-2" htmlFor="role">
                    I am a
                  </label>
                  <select 
                    id="role" 
                    className="w-full bg-black bg-opacity-50 border border-purple-500/50 rounded px-4 py-3 font-['VT323'] text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="freelancer">Freelancer</option>
                    <option value="client">Client</option>
                    <option value="validator">Validator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <motion.button 
                  type="submit"
                  className="w-full font-['Press_Start_2P'] text-sm mt-4 px-6 py-3 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isEmailSubmitted ? "Thanks! You're on the list" : "Get Early Access"}
                </motion.button>
              </form>
            </motion.div>
          </div>
          
          {/* Decorative Elements */}
          <motion.div 
            className="absolute -top-20 left-1/4 w-32 h-32 opacity-20"
            animate={{ 
              y: [0, -20, 0],
              rotate: 360 
            }}
            transition={{ 
              y: { duration: 5, repeat: Infinity, repeatType: "reverse" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            style={{
              background: 'radial-gradient(circle, rgba(157, 0, 255, 0.8) 0%, rgba(157, 0, 255, 0) 70%)'
            }}
          />
          <motion.div 
            className="absolute bottom-10 right-1/4 w-24 h-24 opacity-20"
            animate={{ 
              y: [0, 20, 0],
              rotate: -360 
            }}
            transition={{ 
              y: { duration: 6, repeat: Infinity, repeatType: "reverse" },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
            style={{
              background: 'radial-gradient(circle, rgba(255, 0, 255, 0.8) 0%, rgba(255, 0, 255, 0) 70%)'
            }}
          />
        </section>
        
        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-700/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="mb-6 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="font-['Press_Start_2P'] text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                suregigz
              </div>
              <div className="font-['VT323'] text-lg mt-2 text-purple-300">
                Decentralized Freelancing Platform
              </div>
            </motion.div>
            <motion.div 
              className="flex space-x-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.a 
                href="#" 
                className="text-purple-400 hover:text-pink-400"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                Twitter
              </motion.a>
              <motion.a 
                href="#" 
                className="text-purple-400 hover:text-pink-400"
                whileHover={{ scale: 1.2, rotate: -5 }}
              >
                Discord
              </motion.a>
              <motion.a 
                href="#" 
                className="text-purple-400 hover:text-pink-400"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                GitHub
              </motion.a>
            </motion.div>
          </div>
          <div className="text-center mt-8 font-['VT323'] text-purple-500 text-sm">
            © 2025 suregigz. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}