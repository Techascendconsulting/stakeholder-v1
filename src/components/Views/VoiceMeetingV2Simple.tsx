// Simple Voice Meeting - Clean Layout Version
import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Mic, MicOff } from "lucide-react";

export default function VoiceMeetingV2Simple() {
  console.log('🎨 SIMPLE VOICE MEETING: Clean layout version loaded');
  
  const { selectedProject, selectedStakeholders } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [conversationState, setConversationState] = useState("idle");

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{selectedProject?.name}</h1>
        <p className="text-sm text-gray-600">Simple Voice Meeting - No massive space</p>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-blue-800">✅ CLEAN LAYOUT - No massive empty space below</p>
        <p className="text-sm text-blue-600">Status: {conversationState}</p>
      </div>

      {/* Participants */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Participants</h3>
        <div className="grid grid-cols-2 gap-4">
          {selectedStakeholders.map((stakeholder, idx) => (
            <div key={idx} className="p-3 bg-gray-100 rounded-lg">
              <p className="font-medium">{stakeholder.name}</p>
              <p className="text-sm text-gray-600">{stakeholder.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setConversationState(conversationState === "idle" ? "listening" : "idle")}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            conversationState === "idle" 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-gray-400"
          }`}
        >
          {conversationState === "idle" ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>
        
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
          End Meeting
        </button>
      </div>

      {/* Footer - This should be at the bottom with NO massive space */}
      <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800">🎯 This layout has NO massive empty space!</p>
        <p className="text-sm text-yellow-600">Content flows naturally from top to bottom</p>
      </div>
    </div>
  );
}










