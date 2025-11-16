import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Step } from '../data/journeyData';
import EmailContent from './content/EmailContent';
import VideoContent from './content/VideoContent';
import TaskContent from './content/TaskContent';
import MeetingContent from './content/MeetingContent';
import DocumentContent from './content/DocumentContent';

export default function StepPage({
  step,
  onBack,
  onComplete,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
}: {
  step: Step;
  onBack: () => void;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Step {step.number}</span>
              {step.completed && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900/50 to-black" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
            {step.title}
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-light opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            {step.summary}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative py-6 opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="relative">
            {/* Dark cinematic content container */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800">
              <div className="p-6">
                {step.contentType === 'email' && <EmailContent content={step.content} />}
                {step.contentType === 'video' && <VideoContent content={step.content} />}
                {step.contentType === 'task' && <TaskContent content={step.content} />}
                {step.contentType === 'meeting' && <MeetingContent content={step.content} />}
                {step.contentType === 'document' && <DocumentContent content={step.content} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="relative py-8">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                hasPrevious
                  ? 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800'
                  : 'bg-gray-900/50 text-gray-700 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={onComplete}
              className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold shadow-2xl shadow-green-500/30 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Complete</span>
            </button>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                hasNext
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-900/50 text-gray-700 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


