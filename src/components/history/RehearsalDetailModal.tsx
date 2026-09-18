'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext, InterviewSession } from '@/types/interview';

interface RehearsalDetailModalProps {
  session: InterviewSession | null;
  onClose: () => void;
  onRehearseAgain: (context: CandidateContext) => void;
}

export const RehearsalDetailModal: React.FC<RehearsalDetailModalProps> = ({
  session,
  onClose,
  onRehearseAgain,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <AnimatePresence>
      {session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md"
          style={{ pointerEvents: session ? 'auto' : 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[22px] bg-white dark:bg-[#212121] apple-hairline overflow-hidden shadow-2xl flex flex-col pb-safe"
          >
            {/* iOS Pull Handle on Mobile */}
            <div className="sm:hidden w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 apple-hairline-b">
              <h2 className="text-[17px] font-semibold text-apple-ink dark:text-white truncate pr-2">
                {session.context.role}
              </h2>

              <button
                onClick={onClose}
                className="text-[14px] text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors apple-action shrink-0"
              >
                Done
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-[15px]">
              {session.feedback && (
                <div className="space-y-1.5">
                  <h3 className="text-[16px] font-semibold text-apple-ink dark:text-white">
                    Summary Verdict
                  </h3>
                  <p className="text-apple-ink dark:text-white leading-relaxed">
                    {session.feedback.summaryVerdict}
                  </p>
                  <div className="text-[13px] text-apple-inkMuted pt-0.5">
                    Next Focus: <span className="text-apple-ink dark:text-white font-medium">"{session.feedback.nextRehearsalFocus}"</span>
                  </div>
                </div>
              )}

              {/* Transcript Questions */}
              <div>
                <h3 className="text-[16px] font-semibold text-apple-ink dark:text-white mb-2">
                  Questions & Answers
                </h3>

                <div className="space-y-1">
                  {session.questions.map((q, idx) => {
                    const answer = session.answers[idx];
                    const isExpanded = expandedIndex === idx;

                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className="w-full px-3 py-2.5 text-left flex items-center justify-between group"
                        >
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-[12px] font-semibold text-apple-amber-500">Q{idx + 1}</span>
                            <span className="text-[14px] font-medium text-apple-ink dark:text-white line-clamp-1">
                              {q.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] text-apple-inkMuted">
                            <span>{isExpanded ? 'Hide' : 'View'}</span>
                            <motion.svg
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-60 group-hover:opacity-100"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </motion.svg>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key={`accordion-${idx}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 space-y-1.5">
                                <p className="text-[14px] text-apple-ink dark:text-white italic leading-relaxed">
                                  "{answer?.transcript || 'No response recorded'}"
                                </p>
                                {answer?.evaluation && (
                                  <div className="text-[12px] text-apple-inkMuted">
                                    Clarity: {answer.evaluation.clarity} • Accuracy: {answer.evaluation.technicalAccuracy || 'Good'}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            {session.feedback && (
              <div className="p-4 px-6 apple-hairline-t flex items-center justify-between">
                <span className="text-[13px] text-apple-inkMuted">
                  Focus: "{session.feedback.nextRehearsalFocus}"
                </span>
                <button
                  onClick={() => {
                    const rehearContext: CandidateContext = {
                      role: session.context.role,
                      company: session.context.company,
                      interviewType: session.context.interviewType,
                      durationMinutes: session.context.durationMinutes,
                      resumeText: session.context.resumeText,
                      focusArea: session.feedback?.nextRehearsalFocus || session.context.focusArea,
                    };
                    onClose();
                    onRehearseAgain(rehearContext);
                  }}
                  className="px-4 py-1.5 rounded-full bg-apple-amber-500 hover:bg-apple-amber-600 text-white text-[13px] font-semibold apple-action shadow-sm"
                >
                  Rehearse Again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
