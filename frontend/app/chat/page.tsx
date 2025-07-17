"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const DUMMY_MESSAGES = [
  { sender: "user", text: "How do I pay with NEAR Intents?" },
  { sender: "bot", text: "To pay with NEAR Intents, click the 'Pay with NEAR Intents' button below and follow the instructions." },
  { sender: "user", text: "Can I track my development activity from GitHub here?" },
  { sender: "bot", text: "Yes! Click the 'Track GitHub Activity' button to connect your GitHub and view your latest commits." },
  { sender: "user", text: "Show me my last payment." },
  { sender: "bot", text: "Your last payment of 10 NEAR was sent to dev.near on 2024-06-01." },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input },
      { sender: "bot", text: "(This is a dummy response from NEAR Intents bot.)" },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white flex flex-col items-center justify-center py-12 px-2">
      <motion.div
        className="w-full max-w-2xl bg-gradient-to-br from-purple-900/60 to-cyan-900/60 border border-purple-500/30 rounded-2xl shadow-2xl p-6 flex flex-col"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="font-['Press_Start_2P'] text-3xl md:text-4xl text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-400">
          NEAR Intents Chat
        </h1>
        <div className="flex-1 overflow-y-auto mb-4 max-h-96 scrollbar-thin scrollbar-thumb-purple-700/40 scrollbar-track-transparent">
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-[75%] font-['VT323'] text-lg shadow-md ${
                    msg.sender === "user"
                      ? "bg-cyan-700/60 text-cyan-100 border border-cyan-400/30"
                      : "bg-purple-800/60 text-purple-100 border border-purple-400/30"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-black/60 border border-purple-500/40 text-white font-['VT323'] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-['Press_Start_2P'] shadow hover:from-pink-400 hover:to-cyan-400 transition-colors"
          >
            Send
          </button>
        </form>
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-gray-800 to-purple-700 text-purple-200 font-['VT323'] border border-purple-500/30 shadow hover:from-gray-700 hover:to-pink-700 transition-colors"
            onClick={() => alert("(Dummy) Tracking GitHub development activity...")}
          >
            🐙 Track GitHub Activity
          </button>
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-700 to-pink-600 text-white font-['VT323'] border border-cyan-400/30 shadow hover:from-cyan-600 hover:to-pink-500 transition-colors"
            onClick={() => alert("(Dummy) Initiating NEAR Intents payment...")}
          >
            💸 Pay with NEAR Intents
          </button>
        </div>
        <div className="mt-6 text-center text-purple-400 font-['VT323'] text-sm opacity-70">
          Example prompts: <span className="text-cyan-300">How do I pay with NEAR Intents?</span>, <span className="text-cyan-300">Show me my last payment</span>, <span className="text-cyan-300">Can I track my development activity from GitHub here?</span>
        </div>
      </motion.div>
    </div>
  );
}
