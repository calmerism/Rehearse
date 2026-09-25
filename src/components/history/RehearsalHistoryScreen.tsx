'use client';

import React, { useState, useEffect } from 'react';
import { CandidateContext, InterviewSession } from '@/types/interview';
import { RehearsalDetailModal } from './RehearsalDetailModal';
import { sessionStore } from '@/services/storage/sessionStore';

interface RehearsalHistoryScreenProps {
  sessions: InterviewSession[];
  onStartRehearsal: (context?: Partial<CandidateContext>) => void;
}

export const RehearsalHistoryScreen: React.FC<RehearsalHistoryScreenProps> = ({
  sessions: initialSessions,
  onStartRehearsal,
}) => {
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>(() => {
    const storeSessions = sessionStore.getAllSessions();
    return storeSessions.length > 0 ? storeSessions : initialSessions;
  });

  useEffect(() => {
    setSessions(sessionStore.getAllSessions());
  }, [initialSessions]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-[clamp(1rem,4vw,1.5rem)] py-[clamp(1.5rem,4vh,3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[clamp(1rem,2.5vh,1.75rem)] animate-apple-in">
        <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-[-0.028em] text-apple-ink dark:text-white">
          History
        </h1>

        <button
          onClick={() => onStartRehearsal()}
          className="px-4 py-2 sm:py-1.5 rounded-full bg-[#D05236] hover:bg-[#C94730] text-white text-[13px] font-semibold apple-action shadow-sm"
        >
          New Rehearsal
        </button>
      </div>

      {/* History List */}
      {sessions.length === 0 ? (
        <div className="py-16 text-center text-apple-inkMuted text-[15px] animate-apple-in apple-stagger-1">
          No rehearsals recorded yet.
        </div>
      ) : (
        <div className="space-y-1 animate-apple-in apple-stagger-1">
          {sessions.map((session) => {
            const feedback = session.feedback;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="p-[clamp(0.75rem,2vw,1rem)] -mx-[clamp(0.5rem,1.5vw,1rem)] rounded-2xl hover:bg-black/[0.025] dark:hover:bg-white/[0.04] transition-colors cursor-pointer apple-action"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-4">
                  <h3 className="text-[17px] font-semibold text-apple-ink dark:text-white">
                    {session.context.role}
                  </h3>
                  <span className="text-[13px] text-apple-inkMuted">
                    {formatDate(session.createdAt)}
                  </span>
                </div>

                <div className="text-[14px] text-apple-inkMuted mt-0.5 capitalize">
                  {session.context.interviewType} Interview • {session.questions.length} questions
                </div>

                {feedback && (
                  <div className="mt-2 text-[14px] text-apple-inkMuted leading-relaxed">
                    Focus: <span className="text-apple-ink dark:text-white font-medium">"{feedback.nextRehearsalFocus}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RehearsalDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onRehearseAgain={(rehearContext) => {
          setSelectedSession(null);
          onStartRehearsal(rehearContext);
        }}
      />
    </div>
  );
};
