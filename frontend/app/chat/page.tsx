"use client";

import { useState } from "react";
import { FaGithub, FaPaperPlane, FaMoneyCheckAlt } from "react-icons/fa";
import { SiNear } from "react-icons/si";

interface Message {
  sender: "ai" | "client";
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    sender: "ai",
    text: "Hi Anshu! How can I help you with your project today?",
    time: "09:00 AM",
  },
  {
    sender: "client",
    text: "Show me the latest progress on GitHub.",
    time: "09:01 AM",
  },
  {
    sender: "ai",
    text: "Here's the latest commit: 'Add payment integration'. Would you like to review the code or make a payment?",
    time: "09:02 AM",
  },
];

const aiResponses = [
  "I'm SureGigz AI, your project assistant! I can help you track progress, manage payments, and answer questions about your gigs.",
  "You can ask me to show GitHub activity, send payments, or get updates on your project milestones.",
  "I can also help you with onboarding, gig details, and connecting with developers or clients.",
  "If you need to make a payment, just click the 'Pay with Near Intents' button!",
  "Want to see your project's latest commits? Click 'Track on GitHub' or ask me directly!",
];

const promptSuggestions = [
  "What can you do?",
  "Show me my latest gig progress.",
  "How do I pay a developer?",
  "How do I onboard as a client?",
  "Show me the last commit.",
];

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [aiIndex, setAiIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg: Message = {
      sender: "client",
      text: input,
      time: getCurrentTime(),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMsg: Message = {
        sender: "ai",
        text: aiResponses[aiIndex],
        time: getCurrentTime(),
      };
      setMessages((msgs) => [...msgs, aiMsg]);
      setAiIndex((idx) => (idx + 1) % aiResponses.length);
    }, 700);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 min-h-screen">
        <button className="mb-6 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 font-bold text-left hover:bg-cyan-700/20 transition-all font-['Press_Start_2P']">
          + New chat
        </button>
        <div className="flex-1">
          <h2 className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Previous 30 days</h2>
          <div className="mb-2">
            <div className="px-3 py-2 rounded-lg bg-gray-800 text-white font-semibold cursor-pointer hover:bg-cyan-700/20 transition-all">
              Untitled chat
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
          {/* AI Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-cyan-500 rounded-full p-4 mb-4">
              <SiNear className="text-4xl text-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-['Press_Start_2P']">Hi Anshu</h1>
            <p className="text-gray-300 text-center mb-2">
              I'm SureGigz AI. I can help you track your project, chat about progress, and handle payments.
            </p>
            <span className="inline-block bg-cyan-700/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              AI Project Assistant
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-6 bg-gray-900 rounded-xl p-6 border border-cyan-500/10 shadow-inner" style={{ minHeight: 300 }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-6 flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-3 rounded-2xl shadow ${msg.sender === "ai" ? "bg-cyan-700/20 text-cyan-100" : "bg-purple-700/20 text-purple-100"}`}>
                  <div className="text-sm mb-1">{msg.text}</div>
                  <div className="text-xs text-gray-400 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-4 justify-center">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-cyan-700/20 transition-all font-semibold border border-cyan-500/20">
              <FaGithub className="text-lg" /> Track on GitHub
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold hover:from-cyan-500 hover:to-purple-500 transition-all border-none">
              <FaMoneyCheckAlt className="text-lg" /> Pay with Near Intents
            </button>
          </div>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                className="px-3 py-1 rounded-full bg-gray-800 text-cyan-300 text-xs font-semibold hover:bg-cyan-700/20 border border-cyan-500/20 transition-all"
                onClick={() => handlePromptClick(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <form className="flex items-center gap-2 w-full max-w-2xl mx-auto" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none text-white font-medium"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="p-3 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all"
              disabled={!input.trim()}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          SureGigz AI is your project assistant. You're responsible for your content and work, so be sure to check all responses.
        </div>
      </main>
    </div>
  );
} 