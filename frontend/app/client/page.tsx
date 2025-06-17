"use client"
import { useState } from "react";
import { motion } from "framer-motion";

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    companyAddress: "",
    paymentMethod: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Client Registration Data:", formData);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Client Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Company Name</label>
            <input
              type="text"
              name="companyName"
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Company Address</label>
            <input
              type="text"
              name="companyAddress"
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Preferred Payment Method</label>
            <select
              name="paymentMethod"
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              required
            >
              <option value="">Select a method</option>
              <option value="crypto">Crypto (USDC, ETH, etc.)</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </form>
      </div>
    </motion.div>
  );
}
