'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext, InterviewSession, QualitativeScore } from '@/types/interview';

interface FeedbackReportProps {
  session: InterviewSession;
  onRehearseAgain: (context: CandidateContext) => void;
  onBackToHome: () => void;
  onViewHistory: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  session,
  onRehearseAgain,
  onBackToHome,
  onViewHistory,
}) => {
  const [copied, setCopied] = React.useState(false);
  const feedback = session.feedback;

  if (!feedback) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
        <p className="text-apple-inkMuted text-[17px]">
          Generating your performance report...
        </p>
      </div>
    );
  }

  const getScoreColor = (score: QualitativeScore) => {
    switch (score) {
      case 'Strong':
        return 'text-[#31805A] dark:text-[#3db57a]';
      case 'Good':
        return 'text-apple-amber-500';
      case 'Needs Improvement':
      default:
        return 'text-apple-inkMuted';
    }
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-14 sm:pb-20">
      {/* Header */}
      <div className="mb-4 sm:mb-6 text-center animate-apple-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.028em] text-apple-ink dark:text-white">
          Performance Feedback
        </h1>
      </div>

      {/* Editorial Verdict */}
      <div className="mb-6 sm:mb-8 text-center animate-apple-in apple-stagger-1">
        <p className="text-[16px] sm:text-[19px] font-medium text-apple-ink dark:text-white leading-relaxed max-w-xl mx-auto px-2">
          {feedback.summaryVerdict}
        </p>
      </div>

      {/* 3 Core Competency Metrics (3-column on mobile & desktop) */}
      <div className="grid grid-cols-3 gap-2 py-3 mb-6 sm:mb-8 text-center animate-apple-in apple-stagger-2">
        <div className="py-2 px-1">
          <span className="text-[11px] sm:text-[13px] text-apple-inkMuted block">Technical</span>
          <span className={`text-[18px] sm:text-[24px] font-semibold mt-0.5 block ${getScoreColor(feedback.technicalScore)}`}>
            {feedback.technicalScore}
          </span>
        </div>

        <div className="py-2 px-1">
          <span className="text-[11px] sm:text-[13px] text-apple-inkMuted block">Communication</span>
          <span className={`text-[18px] sm:text-[24px] font-semibold mt-0.5 block ${getScoreColor(feedback.communicationScore)}`}>
            {feedback.communicationScore}
          </span>
        </div>

        <div className="py-2 px-1">
          <span className="text-[11px] sm:text-[13px] text-apple-inkMuted block">Handling</span>
          <span className={`text-[18px] sm:text-[24px] font-semibold mt-0.5 block ${getScoreColor(feedback.interviewHandlingScore)}`}>
            {feedback.interviewHandlingScore}
          </span>
        </div>
      </div>

      {/* What Went Well */}
      <div className="mb-8 animate-apple-in apple-stagger-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-3">
          What Went Well
        </h2>
        <div className="space-y-2.5">
          {feedback.whatWentWell.map((item, i) => (
            <div key={i} className="text-[15px] text-apple-ink dark:text-white leading-relaxed flex items-baseline gap-2.5">
              <span className="text-apple-inkMuted">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What to Improve */}
      <div className="mb-10 animate-apple-in apple-stagger-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-3">
          Areas for Improvement
        </h2>
        <div className="space-y-2.5">
          {feedback.whatToImprove.map((item, i) => (
            <div key={i} className="text-[15px] text-apple-ink dark:text-white leading-relaxed flex items-baseline gap-2.5">
              <span className="text-apple-amber-500">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Rehearsal Callout & CTA */}
      <div className="mb-12 text-center animate-apple-in apple-stagger-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-2">
          Next Rehearsal Focus
        </h2>
        <p className="text-lg sm:text-[19px] font-medium text-apple-ink dark:text-white leading-snug max-w-lg mx-auto">
          "{feedback.nextRehearsalFocus}"
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() =>
              onRehearseAgain({
                role: session.context.role,
                company: session.context.company,
                interviewType: session.context.interviewType,
                durationMinutes: session.context.durationMinutes,
                resumeText: session.context.resumeText,
                focusArea: feedback.nextRehearsalFocus || session.context.focusArea,
              })
            }
            className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-apple-amber-500 hover:bg-apple-amber-600 text-white text-[15px] font-semibold tracking-tight transition-all apple-action shadow-sm"
          >
            Rehearse Again
          </button>

          <button
            onClick={() => {
              const text = `Interview Rehearsal Feedback (${session.context.role})\nOverall: ${feedback.summaryVerdict}\nTechnical: ${feedback.technicalScore}\nCommunication: ${feedback.communicationScore}\nHandling: ${feedback.interviewHandlingScore}\n\nWhat Went Well:\n${feedback.whatWentWell.map(w => '• ' + w).join('\n')}\n\nAreas for Improvement:\n${feedback.whatToImprove.map(i => '• ' + i).join('\n')}\n\nNext Rehearsal Focus:\n${feedback.nextRehearsalFocus}`;
              navigator.clipboard?.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-[14px] text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors apple-action px-3 py-1 min-w-[140px] text-center"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.16 }}
                  className="text-[#31805A] dark:text-[#3db57a] font-medium inline-flex items-center gap-1"
                >
                  ✓ Copied to Clipboard
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.16 }}
                >
                  Copy Summary
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-[14px] text-apple-inkMuted pt-4 apple-hairline-t">
        <button
          onClick={onBackToHome}
          className="hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          ← Home
        </button>

        <button
          onClick={onViewHistory}
          className="hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          View in History →
        </button>
      </div>
    </div>
  );
};
