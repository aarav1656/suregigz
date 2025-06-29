"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface PaymentFormData {
  developerName: string;
  projectTitle: string;
  amount: string;
  paymentMethod: "crypto" | "stripe";
  cryptoCurrency: string;
  description: string;
}

export default function PaymentPage() {
  const [formData, setFormData] = useState<PaymentFormData>({
    developerName: "",
    projectTitle: "",
    amount: "",
    paymentMethod: "crypto",
    cryptoCurrency: "NEAR",
    description: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const cryptoOptions = [
    { value: "NEAR", label: "NEAR Protocol", icon: "🌐" },
    { value: "BTC", label: "Bitcoin", icon: "₿" },
    { value: "ETH", label: "Ethereum", icon: "Ξ" },
    { value: "USDC", label: "USDC", icon: "💵" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Here you would integrate with actual payment APIs
      console.log("Processing payment:", formData);
      
      // Show success message
      alert("Payment processed successfully!");
      
    } catch (error) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 font-['Press_Start_2P']">
              Payment Gateway
            </h1>
            <p className="text-gray-300 text-lg">
              Pay developers securely with crypto or traditional payment methods
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-cyan-500/30">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Developer Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-300">
                    Developer Name
                  </label>
                  <input
                    type="text"
                    name="developerName"
                    value={formData.developerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="Enter developer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-300">
                    Project Title
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="Enter project title"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2 text-cyan-300">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-700 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium mb-4 text-cyan-300">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "crypto"
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-gray-600 bg-gray-700 hover:border-cyan-500/30"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: "crypto" })
                    }
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <div className="font-semibold">Crypto</div>
                      <div className="text-xs text-gray-400">Fast & Secure</div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "stripe"
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-gray-600 bg-gray-700 hover:border-cyan-500/30"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, paymentMethod: "stripe" })
                    }
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-semibold">Stripe</div>
                      <div className="text-xs text-gray-400">Card Payment</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Crypto Currency Selection */}
              {formData.paymentMethod === "crypto" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-300">
                    Select Cryptocurrency
                  </label>
                  <select
                    name="cryptoCurrency"
                    value={formData.cryptoCurrency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                  >
                    {cryptoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-cyan-300">
                  Payment Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none"
                  placeholder="Describe what this payment is for..."
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-700 rounded-lg p-4 border border-cyan-500/20">
                <h3 className="font-semibold mb-3 text-cyan-300">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Developer:</span>
                    <span className="font-medium">{formData.developerName || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span className="font-medium">{formData.projectTitle || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium text-cyan-300">
                      ${formData.amount || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="font-medium capitalize">
                      {formData.paymentMethod}
                      {formData.paymentMethod === "crypto" && ` (${formData.cryptoCurrency})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:from-cyan-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay $${formData.amount || "0.00"}`
                )}
              </motion.button>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <div className="flex items-center justify-center mb-2">
              <span className="mr-2">🔒</span>
              <span>All payments are secured with end-to-end encryption</span>
            </div>
            <p>Your payment information is protected and never stored on our servers</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 