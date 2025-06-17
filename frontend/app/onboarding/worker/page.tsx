'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function WorkerOnboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    skills: '',
    experience: '',
    hourlyRate: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add form submission logic
    console.log('Form submitted:', formData);
    router.push('/dashboard'); // Redirect to dashboard after submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-center font-['Press_Start_2P']">
            Worker Onboarding
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Complete your profile to start finding gigs
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                placeholder="e.g., Web Development, UI/UX Design, Project Management"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                placeholder="Tell us about yourself and your experience..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:from-cyan-500 hover:to-purple-500 transition-all"
            >
              Complete Profile
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 