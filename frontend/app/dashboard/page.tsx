"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ClientProfile = {
  fullName: string;
  email: string;
  companyName?: string;
  industry: string;
  projectDescription: string;
  budget: string;
};

type WorkerProfile = {
  fullName: string;
  email: string;
  skills: string;
  experience: string;
  hourlyRate: string;
  bio: string;
};

type Profile = (ClientProfile & { type: "client" }) | (WorkerProfile & { type: "worker" });

const PROFILE_IMAGE = "https://randomuser.me/api/portraits/men/32.jpg"; // Hardcoded profile image

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const client = localStorage.getItem("clientProfile");
    const worker = localStorage.getItem("workerProfile");
    if (worker) {
      setProfile({ ...JSON.parse(worker), type: "worker" });
      setType("worker");
    } else if (client) {
      setProfile({ ...JSON.parse(client), type: "client" });
      setType("client");
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 font-['Press_Start_2P']">Welcome to your Dashboard</h1>
          <p className="text-gray-400">No profile data found. Please complete onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-10 border border-cyan-500/30">
          <div className="flex flex-col items-center mb-8">
            <Image
              src={PROFILE_IMAGE}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-cyan-500 shadow-lg mb-4"
            />
            <h2 className="text-2xl font-bold font-['Press_Start_2P'] mb-2">
              {profile.fullName}
            </h2>
            <p className="text-cyan-400 text-sm mb-1">{profile.email}</p>
            <span className="inline-block bg-cyan-700/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              {type === "client" ? "Client" : "Worker"}
            </span>
          </div>

          <div className="space-y-4">
            {type === "client" ? (
              <>
                <div>
                  <span className="font-semibold text-cyan-300">Company Name:</span> {(profile as ClientProfile).companyName || <span className="text-gray-400">N/A</span>}
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Industry:</span> {(profile as ClientProfile).industry}
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Project Description:</span>
                  <div className="bg-gray-900 rounded-lg p-3 mt-1 text-gray-200 text-sm">
                    {(profile as ClientProfile).projectDescription}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Budget:</span> ${(profile as ClientProfile).budget}
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-semibold text-cyan-300">Skills:</span> {(profile as WorkerProfile).skills}
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Experience:</span> {(profile as WorkerProfile).experience} years
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Hourly Rate:</span> ${(profile as WorkerProfile).hourlyRate}/hr
                </div>
                <div>
                  <span className="font-semibold text-cyan-300">Bio:</span>
                  <div className="bg-gray-900 rounded-lg p-3 mt-1 text-gray-200 text-sm">
                    {(profile as WorkerProfile).bio}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 