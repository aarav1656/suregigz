// pages/index.js
"use client"
import React, { useState } from 'react';
import Head from 'next/head';
import { motion, Variants } from 'framer-motion';
import { WaitlistModal } from './components/WaitlistModal';

export default function Home() {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const featureVariant: Variants = {
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

  // const gridVariant = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: { duration: 1.5 }
  //   }
  // };

  const problemIcons = [
    "📦", // Mismatched expectations on deliverables
    "⚖️", // Unfair dispute handling
    "💸", // Payment insecurity for freelancers
    "🕵️‍♂️", // Difficulty verifying professional expertise
    "🏢", // Centralized arbitration with low transparency
  ];

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        let errorMessage = 'Something went wrong. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        setSubmitMessage(errorMessage);
        return;
      }

      try {
        await response.json();
      } catch (jsonError) {
        console.warn('Response was successful but JSON parsing failed:', jsonError);
      }

      setIsEmailSubmitted(true);
      setSubmitMessage('Thanks! You\'re now on the waitlist 🎉');
      e.currentTarget.reset();
      setTimeout(() => {
        setIsEmailSubmitted(false);
        setSubmitMessage('');
        setIsModalOpen(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitMessage('Unable to connect to server. Please check your internet connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Head>
        <title>suregigz - Decentralized Freelancing Platform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
              Freelance without fear on NEARProtocol
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
                onClick={openModal}
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
                  <div className="text-green-400 mb-2"> ~ 🔐 Smart contracts lock job terms & payments</div>
                  <div className="text-purple-300 mb-2"> ~ 💰 Client escrow funds locked: 1.5 ETH</div>
                  <div className="text-cyan-400 mb-2"> ~ 🤖 AI checks work for fairness</div>
                  <div className="text-pink-400 mb-2"> ~ 🧑‍⚖️ Disputes solved by community & AI</div>
                  <div className="text-yellow-400 mb-2"> ~ 💸 Payments released only when work is validated</div>
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
              className="font-['Press_Start_2P'] text-4xl md:text-3xl text-red-500 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              ❌ Problems
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
                  <span className="text-red-400 text-2xl mr-3">{problemIcons[index]}</span>
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
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8"
              variants={featureVariant}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🔐</span>
                <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">No More Broken Promises</h3>
              </div>
              <p className="font-['VT323'] text-xl mt-2">
                Every job has a smart contract. The rules and payment are locked in, so everyone knows what to expect.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8"
              variants={featureVariant}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🤖</span>
                <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">AI-Powered Work Evaluation</h3>
              </div>
              <p className="font-['VT323'] text-xl mt-2">
                AI compares submitted work with the job description, generating relevance scores for objective feedback.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8"
              variants={featureVariant}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🧑‍⚖️</span>
                <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">Decentralized Dispute Resolution</h3>
              </div>
              <p className="font-['VT323'] text-xl mt-2">
                Verified validators (proven via ZKPass) and AI jointly resolve disputes with fairness and transparency.
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-lg p-8"
              variants={featureVariant}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">💸</span>
                <h3 className="font-['Press_Start_2P'] text-lg text-cyan-400">Escrow-Backed Payments</h3>
              </div>
              <p className="font-['VT323'] text-xl mt-2">
                Client payments are locked in escrow and released only when work is validated or disputes are resolved.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              className="font-['Press_Start_2P'] text-3xl md:text-4xl bg-gradient-to-r from-yellow-400 to-pink-400 text-transparent bg-clip-text drop-shadow-lg mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <span role="img" aria-label="star">🌟</span> Benefits
            </motion.h2>
          </div>

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
              Join The Waitlist
            </motion.h2>
            <p className="font-['VT323'] text-xl md:text-2xl max-w-3xl mx-auto">
              Get exclusive early access to a safer, smarter way to freelance.
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
                  name="email"
                  required
                  disabled={isSubmitting}
                  className="w-full bg-black bg-opacity-50 border border-purple-500/50 rounded px-4 py-3 font-['VT323'] text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                  placeholder="enter@your.email"
                />
              </div>
              <div className="mb-4">
                <label className="block font-['VT323'] text-xl mb-2" htmlFor="role">
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  disabled={isSubmitting}
                  className="w-full bg-black bg-opacity-50 border border-purple-500/50 rounded px-4 py-3 font-['VT323'] text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="validator">Validator</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {submitMessage && (
                <div className={`mb-4 p-3 rounded font-['VT323'] text-lg ${isEmailSubmitted
                  ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                  : 'bg-red-900/30 border border-red-500/30 text-red-400'
                  }`}>
                  {submitMessage}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-['Press_Start_2P'] text-sm mt-4 px-6 py-3 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? "Submitting..." : (isEmailSubmitted ? "Thanks! You're on the list" : "Get Early Access")}
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

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleEmailSubmit}
        isSubmitting={isSubmitting}
        isEmailSubmitted={isEmailSubmitted}
        submitMessage={submitMessage}
      />
    </>
  );
}