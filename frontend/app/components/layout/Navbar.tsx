import React from 'react';
import { motion } from 'framer-motion';
import { ConnectWallet } from '../wallet/ConnectWallet';
import { NotificationButton } from '../notifications/NotificationButton';

interface NavbarProps {
  onOpenModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  return (
    <nav className="border-b border-purple-700 border-opacity-50 backdrop-filter backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
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

          {/* Center Navigation Links */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-baseline space-x-8">
              <motion.button
                onClick={onOpenModal}
                className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                whileHover={{ scale: 1.05 }}
              >
                Your Gigs
              </motion.button>
              <motion.button
                onClick={onOpenModal}
                className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                whileHover={{ scale: 1.05 }}
              >
                Post a Gig
              </motion.button>
              <motion.button
                onClick={onOpenModal}
                className="font-['VT323'] text-xl hover:text-pink-400 px-3 py-2"
                whileHover={{ scale: 1.05 }}
              >
                Find a Gig
              </motion.button>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectWallet />
            <NotificationButton />

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              className="text-purple-400 hover:text-pink-400"
              whileHover={{ scale: 1.1 }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 