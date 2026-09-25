'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext, InterviewSession, QualitativeScore } from '@/types/interview';
import { X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

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

  if (!session) return null;

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

  const renderSegmentedMeter = (score: QualitativeScore) => {
    const level = score === 'Strong' ? 3 : score === 'Good' ? 2 : 1;
    const labelColor =
      score === 'Strong'
        ? 'text-[#34c759]'
        : score === 'Good'
        ? 'text-[#D05236]'
        : 'text-apple-inkMuted dark:text-white/50';

    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1" aria-hidden="true">
          {[1, 2, 3].map((step) => {
            const isFilled = step <= level;
            const stepColor =
              score === 'Strong'
                ? 'bg-[#34c759]'
                : score === 'Good'
                ? 'bg-[#D05236]'
                : 'bg-black/40 dark:bg-white/40';

            return (
              <span
                key={step}
                className={`w-3 h-1 rounded-full transition-colors ${
                  isFilled ? stepColor : 'bg-black/10 dark:bg-white/10'
                }`}
              />
            );
          })}
        </div>
        <span className={`text-[12px] font-medium ${labelColor}`}>
          {score}
        </span>
      </div>
    );
  };

  const durationMin = Math.max(Math.round((session.totalDurationSeconds || 0) / 60), 1);
  const feedback = session.feedback;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[22px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col pb-safe text-apple-ink dark:text-white"
        >
          {/* iOS Sheet Drag Indicator on Mobile */}
          <div className="sm:hidden w-10 h-1 bg-black/20 dark:bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

          {/* Modal Header */}
          <div className="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-black/10 dark:border-white/10">
            <div className="min-w-0 pr-4">
              <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-apple-ink dark:text-white truncate">
                {session.context.role}
              </h2>
              <p className="text-[13px] text-apple-inkMuted dark:text-white/50 tracking-tight mt-0.5">
                {session.context.interviewType.charAt(0).toUpperCase() + session.context.interviewType.slice(1)} Rehearsal
                <span className="mx-1.5 opacity-40">·</span>
                {durationMin} min
                <span className="mx-1.5 opacity-40">·</span>
                {formatDate(session.createdAt || '')}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-apple-inkMuted dark:text-white/70 hover:text-apple-ink dark:hover:text-white transition-colors apple-action shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[15px]">
            {feedback && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-apple-ink dark:text-white mb-2">
                    Summary Verdict
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-apple-ink/90 dark:text-white/90 leading-[1.6] font-normal">
                    {feedback.summaryVerdict}
                  </p>
                </div>

                {/* Performance Dimension Segmented Meters */}
                {(feedback.technicalScore || feedback.communicationScore || feedback.interviewHandlingScore) && (
                  <div className="pt-3 pb-1 border-t border-b border-black/10 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5">
                    {feedback.technicalScore && (
                      <div className="py-2.5 flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-medium text-apple-ink/80 dark:text-white/80">Technical Accuracy & Architecture</span>
                        {renderSegmentedMeter(feedback.technicalScore)}
                      </div>
                    )}
                    {feedback.communicationScore && (
                      <div className="py-2.5 flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-medium text-apple-ink/80 dark:text-white/80">Communication & Structure</span>
                        {renderSegmentedMeter(feedback.communicationScore)}
                      </div>
                    )}
                    {feedback.interviewHandlingScore && (
                      <div className="py-2.5 flex items-center justify-between gap-3 text-[13px]">
                        <span className="font-medium text-apple-ink/80 dark:text-white/80">Interview Handling & Agility</span>
                        {renderSegmentedMeter(feedback.interviewHandlingScore)}
                      </div>
                    )}
                  </div>
                )}

                {/* Priority Focus */}
                <div className="pt-1">
                  <span className="text-[12px] font-medium text-apple-inkMuted dark:text-white/50 block mb-0.5">
                    Priority Focus for Next Session
                  </span>
                  <p className="text-[14px] sm:text-[15px] font-medium text-apple-ink dark:text-white leading-normal">
                    "{feedback.nextRehearsalFocus}"
                  </p>
                </div>
              </div>
            )}

            {/* Questions & Spoken Answers */}
            {session.questions && session.questions.length > 0 && (
              <div className="pt-2 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-apple-ink dark:text-white">
                    Questions & Answers
                  </h3>
                  <span className="text-[12px] text-apple-inkMuted dark:text-white/50">
                    {session.questions.length} {session.questions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>

                <div className="divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
                  {session.questions.map((q, idx) => {
                    const answer = session.answers[idx];
                    const isExpanded = expandedIndex === idx;

                    return (
                      <div key={q.id || idx} className="py-1">
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                          className="w-full py-3 text-left flex items-start justify-between gap-3 group"
                        >
                          <div className="flex items-baseline gap-3 min-w-0 pr-2">
                            <span className="font-mono text-[12px] text-apple-inkMuted dark:text-white/40 shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[14px] sm:text-[15px] font-medium text-apple-ink dark:text-white leading-normal">
                              {q.text.replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '').trim()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-apple-inkMuted dark:text-white/50 pt-0.5">
                            <span className="text-[12px] hidden sm:inline-block">
                              {isExpanded ? 'Hide' : 'Review'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key={`accordion-${idx}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pl-7 pr-2 pb-4 pt-1 space-y-2.5">
                                <div>
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-inkMuted dark:text-white/40 block mb-1">
                                    Response Captured
                                  </span>
                                  <p className="text-[14px] text-apple-ink/90 dark:text-white/90 italic leading-relaxed">
                                    "{answer?.transcript || 'No spoken response recorded.'}"
                                  </p>
                                </div>

                                {answer?.evaluation && (
                                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-apple-inkMuted dark:text-white/50 pt-1 border-t border-black/5 dark:border-white/5">
                                    <span>Clarity: <strong className="font-medium text-apple-ink dark:text-white">{answer.evaluation.clarity}</strong></span>
                                    <span>•</span>
                                    <span>Technical Accuracy: <strong className="font-medium text-apple-ink dark:text-white">{answer.evaluation.technicalAccuracy || 'Good'}</strong></span>
                                    {answer.durationSeconds && (
                                      <>
                                        <span>•</span>
                                        <span>{answer.durationSeconds}s duration</span>
                                      </>
                                    )}
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
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between bg-black/[0.015] dark:bg-white/[0.015]">
            <button
              onClick={onClose}
              className="text-[13px] text-apple-inkMuted dark:text-white/60 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
            >
              Done
            </button>

            {feedback && (
              <button
                onClick={() => {
                  const rehearContext: CandidateContext = {
                    role: session.context.role,
                    company: session.context.company,
                    interviewType: session.context.interviewType,
                    durationMinutes: session.context.durationMinutes,
                    resumeText: session.context.resumeText,
                    focusArea: feedback.nextRehearsalFocus || session.context.focusArea,
                  };
                  onClose();
                  onRehearseAgain(rehearContext);
                }}
                className="px-5 py-2 rounded-full bg-[#D05236] hover:bg-[#C94730] text-white text-[13px] font-semibold apple-action shadow-sm flex items-center gap-2 active:scale-[0.97] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rehearse Again</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
