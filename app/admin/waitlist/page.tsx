"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface WaitlistEntry {
  id: string;
  email: string;
  role: string;
  timestamp: string;
}

export default function AdminWaitlist() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const response = await fetch('/api/waitlist');
      const data = await response.json();
      
      if (response.ok) {
        setWaitlist(data.entries || []);
      } else {
        setError(data.error || 'Failed to fetch waitlist');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Email', 'Role', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...waitlist.map(entry => 
        [entry.email, entry.role, entry.timestamp].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="font-['VT323'] text-2xl">Loading waitlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-['Press_Start_2P'] text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
            Waitlist Admin
          </h1>
          <div className="flex items-center justify-between">
            <div className="font-['VT323'] text-xl text-purple-300">
              Total Entries: {waitlist.length}
            </div>
            {waitlist.length > 0 && (
              <motion.button
                onClick={downloadCSV}
                className="font-['Press_Start_2P'] text-sm px-6 py-3 rounded-md bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download CSV
              </motion.button>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded mb-8 font-['VT323'] text-lg">
            {error}
          </div>
        )}

        {waitlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-['VT323'] text-2xl text-purple-300 mb-4">
              No waitlist entries yet
            </div>
            <div className="font-['VT323'] text-lg text-purple-500">
              Entries will appear here as people sign up
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/40 border-b border-purple-500/30">
                  <tr>
                    <th className="font-['Press_Start_2P'] text-sm text-left px-6 py-4 text-cyan-400">
                      #
                    </th>
                    <th className="font-['Press_Start_2P'] text-sm text-left px-6 py-4 text-cyan-400">
                      Email
                    </th>
                    <th className="font-['Press_Start_2P'] text-sm text-left px-6 py-4 text-cyan-400">
                      Role
                    </th>
                    <th className="font-['Press_Start_2P'] text-sm text-left px-6 py-4 text-cyan-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-purple-500/20 hover:bg-purple-900/20"
                    >
                      <td className="font-['VT323'] text-lg px-6 py-4 text-purple-300">
                        {index + 1}
                      </td>
                      <td className="font-['VT323'] text-lg px-6 py-4">
                        {entry.email}
                      </td>
                      <td className="font-['VT323'] text-lg px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-['Press_Start_2P'] ${
                          entry.role === 'freelancer' ? 'bg-pink-900/30 text-pink-400' :
                          entry.role === 'client' ? 'bg-cyan-900/30 text-cyan-400' :
                          entry.role === 'validator' ? 'bg-green-900/30 text-green-400' :
                          'bg-purple-900/30 text-purple-400'
                        }`}>
                          {entry.role}
                        </span>
                      </td>
                      <td className="font-['VT323'] text-lg px-6 py-4 text-purple-300">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="font-['Press_Start_2P'] text-sm text-purple-400 hover:text-pink-400 underline"
          >
            ← Back to Landing Page
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 