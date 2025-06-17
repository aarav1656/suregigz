'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WaitlistModal } from '../WaitlistModal';
import { motion } from 'framer-motion';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Grid Background */}
      <motion.div
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage: 'linear-gradient(rgba(120, 0, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(120, 0, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated Gradient Overlay */}
      <motion.div
        className="fixed inset-0 z-0 opacity-30"
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenModal={() => setIsModalOpen(true)} />
        <main className="flex-grow flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleEmailSubmit}
        isSubmitting={isSubmitting}
        isEmailSubmitted={isEmailSubmitted}
        submitMessage={submitMessage}
      />
    </div>
  );
} 