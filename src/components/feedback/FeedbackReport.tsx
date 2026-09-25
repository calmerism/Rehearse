'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext, InterviewSession, QualitativeScore, Question } from '@/types/interview';
import { Check, Copy, RotateCcw, ChevronDown, ChevronUp, Clock, ArrowLeft, History, Award } from 'lucide-react';

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
      <div className="max-w-[760px] mx-auto px-6 py-24 text-center">
        <div className="w-10 h-10 border-2 border-apple-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-apple-inkMuted dark:text-white/60 text-[15px]">
          Compiling your rehearsal feedback report...
        </p>
      </div>
    );
  }

  const getScoreBadge = (score: QualitativeScore) => {
    switch (score) {
      case 'Strong':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-semibold tracking-tight bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
            Strong
          </span>
        );
      case 'Good':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-semibold tracking-tight bg-apple-amber-500/15 text-apple-amber-600 dark:text-apple-amber-400 border border-apple-amber-500/25">
            Good
          </span>
        );
      case 'Needs Improvement':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-semibold tracking-tight bg-black/[0.05] dark:bg-white/[0.08] text-apple-inkMuted dark:text-white/70 border border-black/10 dark:border-white/12">
            Needs Improvement
          </span>
        );
    }
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

Growth Areas:
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

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-8 py-6 sm:py-12 text-apple-ink dark:text-white">
      {/* Top Navigation & Context Breadcrumb */}
      <div className="flex items-center justify-between text-[13px] text-apple-inkMuted dark:text-white/60 mb-6 sm:mb-8">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span>{session.context.role}</span>
          <span className="opacity-40">•</span>
          <span>{session.context.interviewType}</span>
          <span className="opacity-40">•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Main Title (SF Pro Display, strict negative tracking, no kicker chip) */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-[-0.03em] leading-[1.1] text-apple-ink dark:text-white">
          Rehearsal Summary
        </h1>
      </div>

      {/* Executive Summary Surface (Pitch Black, Crisp Hairline, Warm Apple Depth) */}
      <div className="mb-8 p-6 sm:p-7 rounded-2xl bg-black/[0.02] dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.1] shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold tracking-tight uppercase text-apple-inkMuted dark:text-white/60">
              Executive Assessment
            </span>
            <p className="text-[17px] sm:text-[19px] font-medium leading-[1.45] text-apple-ink dark:text-white max-w-2xl">
              {feedback.summaryVerdict}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-apple-amber-500/10 border border-apple-amber-500/20 text-apple-amber-500 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Priority Focus Banner */}
        <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-apple-amber-600 dark:text-apple-amber-400">
              Next Priority Focus
            </span>
            <p className="text-[15px] font-medium text-apple-ink dark:text-white">
              "{feedback.nextRehearsalFocus}"
            </p>
          </div>

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
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-apple-amber-500 hover:bg-apple-amber-600 active:scale-[0.97] text-white text-[13px] sm:text-[14px] font-semibold tracking-tight transition-all apple-action shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rehearse Again</span>
          </button>
        </div>
      </div>

      {/* Evaluated Competency Dimensions (Apple Inset Grouped Row Layout) */}
      <div className="mb-8">
        <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.015em] mb-3 text-apple-ink dark:text-white">
          Evaluated Dimensions
        </h2>

        <div className="rounded-2xl bg-black/[0.02] dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.1] divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
          {/* Dimension 1: Technical */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[15px] font-medium block text-apple-ink dark:text-white">
                Technical Accuracy & Architecture
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block mt-0.5">
                Depth of system design choices, data modeling, concurrency, and trade-offs
              </span>
            </div>
            <div className="shrink-0">{getScoreBadge(feedback.technicalScore)}</div>
          </div>

          {/* Dimension 2: Communication */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[15px] font-medium block text-apple-ink dark:text-white">
                Communication & Structural Clarity
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block mt-0.5">
                Structured explanations, concise phrasing, and logical problem breakdown
              </span>
            </div>
            <div className="shrink-0">{getScoreBadge(feedback.communicationScore)}</div>
          </div>

          {/* Dimension 3: Interview Handling */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[15px] font-medium block text-apple-ink dark:text-white">
                Interview Handling & Agility
              </span>
              <span className="text-[13px] text-apple-inkMuted dark:text-white/60 block mt-0.5">
                Composure under technical follow-ups, constraints, and interviewer probes
              </span>
            </div>
            <div className="shrink-0">{getScoreBadge(feedback.interviewHandlingScore)}</div>
          </div>
        </div>
      </div>

      {/* Two-Column Structured Takeaways (Editorial Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Demonstrated Strengths */}
        <div className="p-5 sm:p-6 rounded-2xl bg-black/[0.02] dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.1] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-[16px] font-semibold tracking-tight text-apple-ink dark:text-white">
                Demonstrated Strengths
              </h3>
            </div>
            <ul className="space-y-3">
              {feedback.whatWentWell.map((item, idx) => (
                <li key={idx} className="text-[14px] text-apple-ink/90 dark:text-white/90 leading-relaxed flex items-start gap-2.5">
                  <span className="text-emerald-500 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Growth Recommendations */}
        <div className="p-5 sm:p-6 rounded-2xl bg-black/[0.02] dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.1] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-2 h-2 rounded-full bg-apple-amber-500" />
              <h3 className="text-[16px] font-semibold tracking-tight text-apple-ink dark:text-white">
                Growth Recommendations
              </h3>
            </div>
            <ul className="space-y-3">
              {feedback.whatToImprove.map((item, idx) => (
                <li key={idx} className="text-[14px] text-apple-ink/90 dark:text-white/90 leading-relaxed flex items-start gap-2.5">
                  <span className="text-apple-amber-500 shrink-0 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Session Questions & Transcript Breakdown (Apple Transcripts style) */}
      {session.questions && session.questions.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white">
              Questions & Transcripts
            </h2>
            <span className="text-[12px] text-apple-inkMuted dark:text-white/50">
              {session.questions.length} questions • {durationMin} min rehearsal
            </span>
          </div>

          <div className="rounded-2xl bg-black/[0.02] dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.1] divide-y divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
            {session.questions.map((q: Question, idx: number) => {
              const answer = session.answers[idx];
              const isExpanded = expandedQuestionId === (q.id || `q_${idx}`);
              const questionId = q.id || `q_${idx}`;

              return (
                <div key={questionId} className="transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : questionId)}
                    className="w-full px-5 py-3.5 text-left flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-baseline gap-2.5 min-w-0 pr-2">
                      <span className="font-mono text-[12px] font-semibold text-apple-amber-500 shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-[14px] sm:text-[15px] font-medium text-apple-ink dark:text-white leading-snug line-clamp-2">
                        {q.text.replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '').trim()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-apple-inkMuted dark:text-white/50 pt-0.5">
                      <span className="text-[11px] hidden sm:inline-block">
                        {isExpanded ? 'Hide' : 'Review'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      ) : (
                        <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 bg-black/[0.015] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.05] space-y-3">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-inkMuted dark:text-white/50 block mb-1">
                              Your Answer
                            </span>
                            <p className="text-[14px] text-apple-ink/90 dark:text-white/90 italic leading-relaxed">
                              "{answer?.transcript || 'No spoken answer captured.'}"
                            </p>
                          </div>

                          {answer?.evaluation && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] text-apple-inkMuted dark:text-white/60">
                              <span>Clarity: <strong className="font-medium text-apple-ink dark:text-white">{answer.evaluation.clarity}</strong></span>
                              <span className="opacity-40">•</span>
                              <span>Accuracy: <strong className="font-medium text-apple-ink dark:text-white">{answer.evaluation.technicalAccuracy || 'Good'}</strong></span>
                              {answer.durationSeconds && (
                                <>
                                  <span className="opacity-40">•</span>
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

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.08] dark:border-white/[0.1] text-[13px] text-apple-inkMuted dark:text-white/60">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied Summary</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <span className="opacity-40 hidden sm:inline">•</span>

          <button
            onClick={onViewHistory}
            className="flex items-center gap-1.5 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
          >
            <History className="w-3.5 h-3.5" />
            <span>View All Rehearsals</span>
          </button>
        </div>

        <button
          onClick={onBackToHome}
          className="text-apple-inkMuted dark:text-white/60 hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};
