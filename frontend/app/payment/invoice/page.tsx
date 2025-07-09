"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PaymentData {
  id: number;
  developerName: string;
  projectTitle: string;
  amount: string;
  paymentMethod: "crypto" | "stripe";
  cryptoCurrency?: string;
  description: string;
  date: string;
  status: string;
}

export default function InvoicePage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const lastPayment = localStorage.getItem("lastPayment");
    if (lastPayment) {
      setPaymentData(JSON.parse(lastPayment));
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 font-['Press_Start_2P']">Invoice Not Found</h1>
          <p className="text-gray-400">No payment data available. Please complete a payment first.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg border border-cyan-500/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-8 text-center">
            <h1 className="text-4xl font-bold font-['Press_Start_2P'] mb-2">INVOICE</h1>
            <p className="text-cyan-100">Payment Confirmation</p>
          </div>

          {/* Invoice Content */}
          <div className="p-8">
            {/* Invoice Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-cyan-300 mb-4">Invoice Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice ID:</span>
                    <span className="font-medium">#{paymentData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-medium">{formatDate(paymentData.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-semibold">✓ Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {paymentData.paymentMethod}
                      {paymentData.cryptoCurrency && ` (${paymentData.cryptoCurrency})`}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-cyan-300 mb-4">Project Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Developer:</span>
                    <span className="font-medium">{paymentData.developerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project:</span>
                    <span className="font-medium">{paymentData.projectTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-2xl font-bold text-purple-400">${paymentData.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {paymentData.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Description</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-200">{paymentData.description}</p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-600">
                  <span className="text-gray-300">Project Payment</span>
                  <span className="font-medium">${paymentData.amount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-600">
                  <span className="text-gray-300">Processing Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between items-center py-3 text-lg font-bold">
                  <span className="text-cyan-300">Total Amount</span>
                  <span className="text-purple-400">${paymentData.amount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:from-cyan-500 hover:to-purple-500 transition-colors font-['Press_Start_2P'] text-sm"
              >
                📄 Print Invoice
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = "/dashboard"}
                className="px-8 py-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors font-['Press_Start_2P'] text-sm border border-cyan-500/30"
              >
                🏠 Back to Dashboard
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-900 p-6 text-center text-gray-400 text-sm">
            <p>Thank you for using SureGigz for your payment processing!</p>
            <p className="mt-1">This invoice serves as your payment confirmation.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 