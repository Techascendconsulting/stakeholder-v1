import React from "react";
import { motion } from "framer-motion";

const participants = [
  { name: "Sarah Miller", avatar: "/images/avatars/sarah-avatar.png", speaking: true },
  { name: "David Thompson", avatar: "/images/avatars/tom-avatar.png", speaking: false },
  { name: "You", avatar: "/images/avatars/victor-avatar.png", speaking: false },
  { name: "James Walker", avatar: "/images/avatars/srikanth-avatar.png", speaking: false },
];

const Waveform = () => {
  return (
    <div className="flex items-center gap-1 mt-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-blue-600/70"
        />
      ))}
    </div>
  );
};

export default function MeetingPreview() {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-md">
      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium w-fit">
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
        Live Stakeholder Meeting
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {participants.map((p) => (
          <motion.div
            key={p.name}
            animate={{
              ...(p.speaking
                ? { boxShadow: ["0 0 0 0 rgba(59,130,246,0.0)", "0 0 0 8px rgba(59,130,246,0.35)", "0 0 0 0 rgba(59,130,246,0.0)"] }
                : {}),
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
            className="relative rounded-[1.4rem] overflow-hidden bg-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
          >
            <img src={p.avatar} alt={p.name} className="w-full h-40 object-contain bg-gradient-to-br from-gray-50 to-gray-100" />
            <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm px-3 py-1.5 text-white text-xs font-medium tracking-wide">
              {p.name}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-[1.4rem] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-4 text-sm text-gray-800 border border-black/5 mb-6">
        <strong className="font-semibold">{participants[0].name}:</strong>
        <span className="ml-1 text-gray-700">
          "We need to reduce the customer onboarding time from 6 weeks to 2 weeks…"
        </span>
        <Waveform />
      </div>
      <div className="flex justify-center gap-4 pt-2">
        {["🎤","🎥","✖"].map((icon, i) => (
          <button
            key={i}
            className={`h-11 w-11 flex items-center justify-center rounded-full transition
            ${icon === "✖" 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

