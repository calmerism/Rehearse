'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext, InterviewSession, QualitativeScore, Question } from '@/types/interview';
import { Check, Copy, RotateCcw, ChevronDown, ChevronUp, ArrowLeft, ArrowUpRight } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const feedback = session.feedback;

  if (!feedback) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-28 text-center">
        <div className="w-8 h-8 border-2 border-[#D05236] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-apple-inkMuted dark:text-white/60 text-[15px]">
          Compiling your rehearsal feedback report...
        </p>
      </div>
    );
  }

  const renderRatingBar = (score: QualitativeScore) => {
    const level = score === 'Strong' ? 3 : score === 'Good' ? 2 : 1;
    const labelColor =
      score === 'Strong'
        ? 'text-[#34c759]'
        : score === 'Good'
        ? 'text-[#D05236]'
        : 'text-apple-inkMuted dark:text-white/50';

    return (
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5" aria-hidden="true">
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
                className={`w-3.5 h-1 rounded-full transition-colors ${
                  isFilled ? stepColor : 'bg-black/10 dark:bg-white/10'
                }`}
              />
            );
          })}
        </div>
        <span className={`text-[13px] font-medium tracking-tight ${labelColor} min-w-[110px] text-right`}>
          {score}
        </span>
      </div>
    );
  };

  const handleCopySummary = () => {
    const text = `Rehearse Interview Summary (${session.context.role})
Verdict: ${feedback.summaryVerdict}

Scores:
• Technical: ${feedback.technicalScore}
• Communication: ${feedback.communicationScore}
• Handling: ${feedback.interviewHandlingScore}

Strengths:
${feedback.whatWentWell.map((w) => `• ${w}`).join('\n')}

Areas for Improvement:
${feedback.whatToImprove.map((i) => `• ${i}`).join('\n')}

Next Rehearsal Focus:
"${feedback.nextRehearsalFocus}"`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formattedDate = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const durationMin = Math.max(Math.round((session.totalDurationSeconds || 0) / 60), 1);
  const questionsCount = session.questions?.length || 0;

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-8 sm:py-16 text-apple-ink dark:text-white">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between text-[13px] text-apple-inkMuted dark:text-white/50 mb-8 sm:mb-12">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-1 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          <span>All Rehearsals</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Title & Editorial Context */}
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-semibold tracking-[-0.03em] leading-[1.08] text-apple-ink dark:text-white mb-3">
          Rehearsal Summary
        </h1>
        <p className="text-[14px] sm:text-[15px] text-apple-inkMuted dark:text-white/60 tracking-tight">
          {session.context.role}
          <span className="mx-2 opacity-40">·</span>
          {session.context.interviewType.charAt(0).toUpperCase() + session.context.interviewType.slice(1)} Rehearsal
          <span className="mx-2 opacity-40">·</span>
          {durationMin} min
          <span className="mx-2 opacity-40">·</span>
          {formattedDate}
        </p>
      </div>

      {/* Editorial Assessment Statement (Unboxed, pure typography on canvas) */}
      <div className="mb-12 sm:mb-16">
        <p className="text-[19px] sm:text-[22px] font-normal leading-[1.55] text-apple-ink/90 dark:text-white/90 max-w-2xl">
          {feedback.summaryVerdict}
        </p>

        {/* Priority Focus & Primary Action */}
        <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
          <div className="max-w-lg space-y-1">
            <span className="text-[13px] font-medium text-apple-inkMuted dark:text-white/50 block">
              Priority Focus for Next Session
            </span>
            <p className="text-[16px] sm:text-[17px] font-medium text-apple-ink dark:text-white leading-relaxed">
              "{feedback.nextRehearsalFocus}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
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
              className="px-6 py-2.5 rounded-full bg-[#D05236] hover:bg-[#C94730] active:scale-[0.97] text-white text-[14px] font-semibold tracking-tight transition-all apple-action shadow-sm flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rehearse Again</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evaluated Dimensions (Apple Inset-Grouped Hairline Table) */}
      <div className="mb-12 sm:mb-16">
        <h2 className="text-[15px] font-semibold tracking-tight text-apple-ink dark:text-white mb-4">
          Assessment Dimensions
        </h2>

        <div className="border-t border-b border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10">
          {/* Dimension 1: Technical */}
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="space-y-0.5 max-w-md">
              <span className="text-[15px] font-medium text-apple-ink dark:text-white block">
                Technical Accuracy & Architecture
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block leading-normal">
                Evaluation of system trade-offs, architecture choices, and depth
              </span>
            </div>
            {renderRatingBar(feedback.technicalScore)}
          </div>

          {/* Dimension 2: Communication */}
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="space-y-0.5 max-w-md">
              <span className="text-[15px] font-medium text-apple-ink dark:text-white block">
                Communication & Structural Clarity
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block leading-normal">
                Verbal structure, concise answers, and logical problem breakdown
              </span>
            </div>
            {renderRatingBar(feedback.communicationScore)}
          </div>

          {/* Dimension 3: Interview Handling */}
          <div className="py-4 flex items-baseline justify-between gap-4">
            <div className="space-y-0.5 max-w-md">
              <span className="text-[15px] font-medium text-apple-ink dark:text-white block">
                Interview Handling & Agility
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block leading-normal">
                Composure under technical follow-ups, constraints, and interviewer probes
              </span>
            </div>
            {renderRatingBar(feedback.interviewHandlingScore)}
          </div>
        </div>
      </div>

      {/* Observations: Strengths & Growth Areas (Clean Editorial Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-14 sm:mb-18">
        {/* Demonstrated Strengths */}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-apple-ink dark:text-white mb-3">
            Demonstrated Strengths
          </h2>
          <ul className="space-y-2.5">
            {feedback.whatWentWell.map((item, idx) => (
              <li key={idx} className="text-[14px] text-apple-ink/85 dark:text-white/85 leading-relaxed flex items-start gap-2">
                <span className="text-apple-inkMuted dark:text-white/40 shrink-0 select-none">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Recommendations */}
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-apple-ink dark:text-white mb-3">
            Areas to Strengthen
          </h2>
          <ul className="space-y-2.5">
            {feedback.whatToImprove.map((item, idx) => (
              <li key={idx} className="text-[14px] text-apple-ink/85 dark:text-white/85 leading-relaxed flex items-start gap-2">
                <span className="text-[#D05236] shrink-0 select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Session Questions & Transcripts (Quiet, Collapsible Apple Disclosure) */}
      {session.questions && session.questions.length > 0 && (
        <div className="mb-14 sm:mb-18 pt-6 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold tracking-tight text-apple-ink dark:text-white">
              Session Transcript
            </h2>
            <span className="text-[12px] text-apple-inkMuted dark:text-white/50">
              {questionsCount} {questionsCount === 1 ? 'question' : 'questions'}
            </span>
          </div>

          <div className="divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
            {session.questions.map((q: Question, idx: number) => {
              const answer = session.answers[idx];
              const questionId = q.id || `q_${idx}`;
              const isExpanded = expandedQuestionId === questionId;

              return (
                <div key={questionId} className="py-1">
                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : questionId)}
                    className="w-full py-3 text-left flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-baseline gap-3 min-w-0 pr-2">
                      <span className="font-mono text-[12px] text-apple-inkMuted dark:text-white/50 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[14px] sm:text-[15px] font-medium text-apple-ink dark:text-white leading-normal line-clamp-2">
                        {q.text.replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '').trim()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-apple-inkMuted dark:text-white/50 pt-0.5">
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pl-8 pr-2 pb-4 pt-1 space-y-3">
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

      {/* Bottom Utility Actions */}
      <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[13px] text-apple-inkMuted dark:text-white/50">
        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#34c759]" />
              <span className="text-[#34c759] font-medium">Summary Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </>
          )}
        </button>

        <button
          onClick={onBackToHome}
          className="hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
