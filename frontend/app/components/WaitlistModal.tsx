import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  isEmailSubmitted: boolean;
  submitMessage: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  isEmailSubmitted,
  submitMessage,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-purple-400 hover:text-pink-400"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-6 text-center">
                Join The Waitlist
              </h2>

              <form onSubmit={onSubmit}>
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
                  <div className={`mb-4 p-3 rounded font-['VT323'] text-lg ${
                    isEmailSubmitted
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 