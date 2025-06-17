import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-700/30 bg-black/80 backdrop-blur-sm">
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
            freelance without fear on NEARProtocol
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
            href="https://x.com/suregigai"
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
  );
}; 