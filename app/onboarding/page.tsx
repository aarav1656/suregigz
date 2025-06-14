'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const router = useRouter();

  const handleSelection = (type: 'client' | 'worker') => {
    router.push(`/onboarding/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold mb-8 font-['Press_Start_2P']">
            Choose Your Path
          </h1>
          <p className="text-gray-300 mb-12 text-lg">
            Select how you want to use SureGigz
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 p-8 rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-all"
              onClick={() => handleSelection('client')}
            >
              <div className="text-5xl mb-4">👔</div>
              <h2 className="text-2xl font-bold mb-4 font-['Press_Start_2P']">Client</h2>
              <p className="text-gray-400">
                Post gigs and find talented workers for your projects
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 p-8 rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-all"
              onClick={() => handleSelection('worker')}
            >
              <div className="text-5xl mb-4">👨‍💻</div>
              <h2 className="text-2xl font-bold mb-4 font-['Press_Start_2P']">Worker</h2>
              <p className="text-gray-400">
                Find gigs and showcase your skills to potential clients
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 