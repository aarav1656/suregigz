"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const gigs = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&q=80",
    title: "Full Stack Web Developer Needed",
    description: "Build a modern web app for a fintech startup. React, Node.js, and MongoDB experience required.",
    pay: 1200,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&q=80",
    title: "UI/UX Designer for Mobile App",
    description: "Design a beautiful and intuitive mobile app for a health tech company. Figma and mobile experience required.",
    pay: 900,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=facearea&w=400&q=80",
    title: "Smart Contract Developer (NEAR)",
    description: "Develop and audit smart contracts for a DeFi platform on NEAR Protocol. Rust experience a plus.",
    pay: 1500,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&q=80",
    title: "Content Writer for Tech Blog",
    description: "Write engaging and SEO-friendly articles for a leading tech blog. Blockchain knowledge preferred.",
    pay: 400,
  },
];

export default function GigsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-10 text-center font-['Press_Start_2P']">
          Available Gigs
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {gigs.map((gig) => (
            <motion.div
              key={gig.id}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800 rounded-2xl shadow-lg border border-cyan-500/30 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={gig.image}
                  alt={gig.title}
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={true}
                />
              </div>
              <div className="flex-1 flex flex-col p-6">
                <h2 className="text-2xl font-bold mb-2 font-['Press_Start_2P'] text-cyan-300">
                  {gig.title}
                </h2>
                <p className="text-gray-300 mb-4 flex-1">{gig.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-semibold text-purple-400">
                    ${gig.pay}
                  </span>
                  <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold hover:from-cyan-500 hover:to-purple-500 transition-colors font-['Press_Start_2P'] text-xs">
                    View & Apply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 