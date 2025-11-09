import { useEffect, useState } from "react";

const script = [
  { who: "Stakeholder", text: "We're currently losing customers during onboarding due to friction in ID verification." },
  { who: "You", text: "Where exactly does the drop-off happen in the process?", align: "right" },
  { who: "Stakeholder", text: "After sign-up — users are required to upload documents, and many don't complete it." },
  { who: "You", text: "So the key issue is the document upload stage?", align: "right", intent: true },
  { who: "Product Owner", text: "Yes — and compliance wants earlier checks, so we need a smoother verification flow." }
];

export default function ConversationTypingPreview() {
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [key, setKey] = useState(0); // Force re-render for loop

  useEffect(() => {
    let i = 0;
    let j = 0;

    const interval = setInterval(() => {
      if (i < script.length) {
        const message = script[i];
        const fullText = message.text;

        if (j < fullText.length) {
          setCurrentText(fullText.slice(0, j + 1));
          j++;
        } else {
          setDisplayed((prev) => [...prev, { ...message, text: fullText }]);
          i++;
          j = 0;
          setCurrentText("");
        }
      } else {
        // Animation complete - wait 3 seconds then restart
        clearInterval(interval);
        setTimeout(() => {
          setDisplayed([]);
          setCurrentText("");
          setKey(prev => prev + 1); // Trigger re-render to restart animation
        }, 3000);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [key]);

  const Bubble = ({ who, text, align, intent }: any) => (
    <div className={`flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
        align === "right" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
      }`}>
        <div className="text-[11px] opacity-80 mb-1">{who}</div>
        <p>{text}</p>
        {intent && <div className="mt-2 text-[11px] opacity-80">• Business Intent Identified</div>}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border-2 border-purple-500/20 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/50 shadow-2xl p-6 max-w-xl mx-auto flex flex-col h-[500px]">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-purple-900 mb-4 flex-shrink-0 shadow-md border border-purple-200">
        <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
        Live Stakeholder Conversation
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {displayed.map((m, i) => (
          <Bubble key={i} {...m} />
        ))}

        {currentText && displayed.length < script.length && (
          <Bubble who={script[displayed.length].who} text={currentText} align={script[displayed.length].align} />
        )}
      </div>
    </div>
  );
}


