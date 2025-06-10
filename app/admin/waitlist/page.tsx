"use client"
import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/waitlist', {
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        const data = await response.json();
        setWaitlist(data.entries || []);
      } else {
        setLoginError('Invalid admin key. Please try again.');
      }
    } catch {
      setLoginError('Connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/waitlist', {
        headers: {
          'x-admin-key': adminKey,
        },
      });
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

  const logout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    setWaitlist([]);
    setError('');
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="font-['Press_Start_2P'] text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
              Admin Access
            </h1>
            <p className="font-['VT323'] text-xl text-purple-300">
              Enter admin key to access waitlist
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-lg p-8 backdrop-filter backdrop-blur-sm">
            <div className="mb-6">
              <label className="block font-['VT323'] text-xl mb-2" htmlFor="adminKey">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                disabled={isLoggingIn}
                className="w-full bg-black bg-opacity-50 border border-purple-500/50 rounded px-4 py-3 font-['VT323'] text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter admin key..."
              />
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-500/30 text-red-400 font-['VT323'] text-lg">
                {loginError}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isLoggingIn || !adminKey.trim()}
              className="w-full font-['Press_Start_2P'] text-sm px-6 py-3 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoggingIn ? { scale: 1.02 } : {}}
              whileTap={!isLoggingIn ? { scale: 0.98 } : {}}
            >
              {isLoggingIn ? 'Accessing...' : 'Access Admin Panel'}
            </motion.button>
          </form>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="font-['Press_Start_2P'] text-sm text-purple-400 hover:text-pink-400 underline"
            >
              ← Back to Landing Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-['Press_Start_2P'] text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Waitlist Admin
            </h1>
            <div className="flex gap-3">
              <motion.button
                onClick={refreshData}
                disabled={loading}
                className="font-['Press_Start_2P'] text-sm px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-lg disabled:opacity-50"
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </motion.button>
              <motion.button
                onClick={logout}
                className="font-['Press_Start_2P'] text-sm px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
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