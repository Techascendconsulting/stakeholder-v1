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
    <div className="rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 p-6 shadow-2xl">
      {/* Live Badge - Enhanced */}
      <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow-lg w-fit">
        <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-lg"></span>
        Live Stakeholder Meeting
      </div>
      
      {/* Participants Grid - Enhanced */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {participants.map((p) => (
          <motion.div
            key={p.name}
            animate={{
              ...(p.speaking
                ? { boxShadow: ["0 0 0 0 rgba(147,51,234,0.0)", "0 0 0 8px rgba(147,51,234,0.4)", "0 0 0 0 rgba(147,51,234,0.0)"] }
                : {}),
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl border-2 border-purple-200/30"
          >
            <img src={p.avatar} alt={p.name} className="w-full h-40 object-contain bg-gradient-to-br from-white to-purple-50/20" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-purple-900/90 to-transparent backdrop-blur-sm px-3 py-2 text-white text-xs font-semibold tracking-wide">
              {p.name}
            </div>
            {p.speaking && (
              <div className="absolute top-2 right-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-xs">🎤</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Message Bubble - Enhanced */}
      <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/50 shadow-lg p-4 text-sm text-gray-800 border-2 border-purple-200/40 mb-6">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SM
          </div>
          <div className="flex-1">
            <strong className="font-bold text-purple-900">{participants[0].name}:</strong>
            <p className="text-gray-700 mt-1">
              "We need to reduce the customer onboarding time from 6 weeks to 2 weeks…"
            </p>
            <Waveform />
          </div>
        </div>
      </div>
      
      {/* Controls - Enhanced */}
      <div className="flex justify-center gap-4 pt-2">
        {["🎤","🎥","✖"].map((icon, i) => (
          <button
            key={i}
            className={`h-12 w-12 flex items-center justify-center rounded-xl font-medium transition-all transform hover:scale-110 shadow-lg
            ${icon === "✖" 
              ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30" 
              : "bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 border-2 border-purple-200"}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}



