import { useEffect, useState } from "react";

const rules = [
  { id: 1, label: "Happy Path", key: "happy" },
  { id: 2, label: "Input/Trigger", key: "trigger" },
  { id: 3, label: "Business Rules", key: "rules" },
  { id: 4, label: "User Feedback", key: "feedback" },
  { id: 5, label: "Error Handling", key: "error" },
  { id: 6, label: "Non-Functional", key: "nonfunc" },
  { id: 7, label: "Split if Needed", key: "split" },
  { id: 8, label: "Proof Sent (e.g. email body, screen state)", key: "proof" }
];

export default function CoachChatSidebar({ storyText, acText }: { storyText: string; acText: string }) {
  const [coachMessages, setCoachMessages] = useState<string[]>([]);
  const [score, setScore] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newMessages: string[] = [];
    const newScore: { [key: string]: boolean } = {};

    const combined = (storyText + " " + acText).toLowerCase();

    rules.forEach(rule => {
      let hit = false;
      let tip = "";

      switch (rule.key) {
        case "happy":
          hit = /so that.*(see|receive|do|access|choose|know)/.test(combined);
          tip = "✅ Happy Path: Make sure the goal is clearly described.";
          break;
        case "trigger":
          hit = /(after|when|on|once) .{3,20}/.test(acText.toLowerCase());
          tip = "✅ Trigger: What causes this to happen?";
          break;
        case "rules":
          hit = /must|only|should|if/.test(acText.toLowerCase());
          tip = "✅ Rules: Clarify what is allowed or restricted.";
          break;
        case "feedback":
          hit = /see|message|shown|confirmation|toast|alert|screen/.test(acText.toLowerCase());
          tip = "✅ Feedback: What will the user see after it happens?";
          break;
        case "error":
          hit = /error|invalid|fails|wrong|missing/.test(acText.toLowerCase());
          tip = "✅ Errors: Describe what happens if something goes wrong.";
          break;
        case "nonfunc":
          hit = /time|speed|mobile|responsive|limit|size/.test(acText.toLowerCase());
          tip = "✅ Non-Functional: Any performance or device constraints?";
          break;
        case "split":
          hit = /(and|then|also).*(send|do|log)/.test(acText.toLowerCase()) || storyText.toLowerCase().includes("email and");
          tip = "⚠️ Try splitting — multiple outcomes found.";
          break;
        case "proof":
          hit = /subject|body|template|email|screen shows|text/.test(acText.toLowerCase());
          tip = "✅ Proof Sent: Is the output content clearly described?";
          break;
        default:
          break;
      }

      newScore[rule.key] = hit;
      if (!hit) newMessages.push(tip);
    });

    setCoachMessages(newMessages);
    setScore(newScore);
  }, [storyText, acText]);

  return (
    <aside className="w-full max-w-sm bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 h-full overflow-y-auto text-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Coach</h2>

      {/* Coach Messages */}
      <div className="mb-6">
        {coachMessages.length === 0 ? (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-600 dark:text-green-400 text-sm">
              🎉 Looks great so far! All key areas covered.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">💬 Live Feedback</h3>
            <ul className="space-y-2">
              {coachMessages.map((msg, idx) => (
                <li key={idx} className="flex items-start p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <span className="text-purple-500 mr-2 mt-0.5">💡</span>
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      {/* Checklist */}
      <div>
        <h3 className="font-medium mb-3 text-gray-900 dark:text-white">📋 Coverage Checklist</h3>
        <ul className="space-y-2">
          {rules.map(rule => (
            <li key={rule.key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">{rule.label}</span>
              <span className={`text-lg ${score[rule.key] ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                {score[rule.key] ? "✓" : "—"}
              </span>
            </li>
          ))}
        </ul>
        
        {/* Progress Summary */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Progress</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {Object.values(score).filter(Boolean).length}/{rules.length}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.values(score).filter(Boolean).length / rules.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
}





















