import ConversationTypingPreview from "./ConversationTypingPreview";
import MeetingPreview from "./MeetingPreview";

export default function InteractionLoop() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Chat Conversation */}
      <div className="w-full">
        <ConversationTypingPreview />
      </div>
      
      {/* Right: Meeting Interface */}
      <div className="w-full">
        <MeetingPreview />
      </div>
    </div>
  );
}

