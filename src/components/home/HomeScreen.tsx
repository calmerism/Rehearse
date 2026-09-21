'use client';

import React from 'react';
import { InterviewSession } from '@/types/interview';

interface HomeScreenProps {
  onStartRehearsal: (focusArea?: string) => void;
  onViewHistory: () => void;
  latestSession?: InterviewSession | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartRehearsal,
  onViewHistory,
}) => {
  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col justify-start items-center px-4 sm:px-6 md:px-8 py-10">
      {/* Hero Section */}
      <div className="max-w-[780px] mx-auto text-center flex flex-col items-center pt-8 sm:pt-14 pb-16 sm:pb-20">
        <h1 className="text-[42px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-bold tracking-[-0.035em] text-apple-ink dark:text-white leading-[1.06] sm:leading-[1.04] text-center animate-apple-in">
          <span className="block">Practice Smarter.</span>
          <span className="block">Interview Better.</span>
          <span className="block text-[#D05236] dark:text-[#E06646]">Get Hired.</span>
        </h1>

        <p className="mt-5 sm:mt-7 text-[16px] sm:text-[18px] md:text-[19px] text-apple-inkMuted dark:text-white/70 leading-[1.5] max-w-[560px] sm:max-w-[620px] mx-auto animate-apple-in apple-stagger-1 font-normal">
          Prepare for real technical, behavioral, and system design interviews with an adaptive AI partner. Grounded in your resume, driven by conversational neural voice, and evaluated with diagnostic scoring.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full animate-apple-in apple-stagger-2">
          <button
            onClick={() => onStartRehearsal()}
            className="w-full sm:w-auto px-8 sm:px-9 py-3.5 rounded-full bg-[#D05236] hover:bg-[#C2492F] text-white font-semibold text-[15px] sm:text-[16px] tracking-tight transition-all apple-action shadow-sm min-h-[48px] flex items-center justify-center"
          >
            Start Rehearsal
          </button>

          <button
            onClick={onViewHistory}
            className="w-full sm:w-auto px-8 sm:px-9 py-3.5 rounded-full bg-[#F5F5F5] dark:bg-white/[0.08] hover:bg-[#EBEBEB] dark:hover:bg-white/[0.12] text-apple-ink dark:text-white text-[15px] sm:text-[16px] font-semibold tracking-tight border border-[#E5E5E5] dark:border-white/10 transition-all apple-action min-h-[48px] flex items-center justify-center"
          >
            View History
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-[840px] border-t border-black/[0.08] dark:border-white/[0.08]" />

      {/* Four Core Demonstration Pillars */}
      <div className="w-full max-w-[840px] py-14 sm:py-20 space-y-14 sm:space-y-16">
        {/* 1. The Problem Being Solved */}
        <section className="space-y-4">
          <h2 className="text-[22px] sm:text-[25px] font-bold tracking-tight text-apple-ink dark:text-white">
            1. The Problem Being Solved
          </h2>
          <div className="text-[15px] sm:text-[16px] text-apple-inkMuted dark:text-white/70 leading-[1.6] space-y-3">
            <p>
              Conventional interview preparation tools rely on static question banks, multiple-choice quizzes, or algorithm problem sets. While these help candidates memorize definitions, they fail to prepare them for the real friction of a live interview.
            </p>
            <p>
              In genuine technical conversations, senior interviewers do not ask rote trivia. They challenge candidates to defend architectural trade-offs (&ldquo;Why PostgreSQL over MongoDB?&rdquo;), handle scale (&ldquo;What breaks if traffic spikes by 100x?&rdquo;), and clearly articulate thought processes verbally under pressure. Candidates frequently struggle not from a lack of technical knowledge, but because they have never rehearsed verbal defense and adaptive follow-up scrutiny.
            </p>
          </div>
        </section>

        {/* 2. How AI Solves It */}
        <section className="space-y-4">
          <h2 className="text-[22px] sm:text-[25px] font-bold tracking-tight text-apple-ink dark:text-white">
            2. How AI Solves It
          </h2>
          <div className="text-[15px] sm:text-[16px] text-apple-inkMuted dark:text-white/70 leading-[1.6] space-y-3">
            <p>
              Rehearse acts as an active, conversational interview partner that listens, evaluates, and adapts in real time:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-apple-ink dark:text-white font-medium">Conversational Voice Interaction:</strong> Rather than a text chat prompt, the candidate verbalizes answers into their microphone and hears studio-grade neural voice synthesis, replicating the authentic sensory experience of a video interview.
              </li>
              <li>
                <strong className="text-apple-ink dark:text-white font-medium">Context-Grounded Follow-ups:</strong> The AI extracts specific technologies and architectural claims from the candidate&rsquo;s answers, formulating spontaneous follow-up questions that probe technical depth and trade-offs instead of following a fixed script.
              </li>
              <li>
                <strong className="text-apple-ink dark:text-white font-medium">Autonomous Pacing &amp; Topic Rotation:</strong> The agent tracks elapsed time against the scheduled duration (10, 20, or 30 minutes), intelligently rotating across core engineering competencies (architecture, database design, concurrency, observability, collaboration).
              </li>
              <li>
                <strong className="text-apple-ink dark:text-white font-medium">Diagnostic Feedback &amp; Deliberate Practice:</strong> Upon completion, the system produces actionable qualitative scoring across technical depth, communication, and interview handling, then pre-seeds the next session with identified weaknesses for targeted improvement.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Applied Azure AI-103 Concepts */}
        <section className="space-y-4">
          <h2 className="text-[22px] sm:text-[25px] font-bold tracking-tight text-apple-ink dark:text-white">
            3. Azure AI-103 Concepts Applied
          </h2>
          <div className="overflow-x-auto border border-black/[0.08] dark:border-white/[0.08] rounded-xl">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/[0.08] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4 font-semibold text-apple-ink dark:text-white">AI-103 Pillar</th>
                  <th className="py-3 px-4 font-semibold text-apple-ink dark:text-white">Azure Service</th>
                  <th className="py-3 px-4 font-semibold text-apple-ink dark:text-white">Implementation in Rehearse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-apple-inkMuted dark:text-white/70">
                <tr>
                  <td className="py-3 px-4 font-medium text-apple-ink dark:text-white">Speech Services</td>
                  <td className="py-3 px-4">Azure AI Speech</td>
                  <td className="py-3 px-4">Continuous real-time Speech-to-Text (STT) for candidate responses and 24kHz 160kbps Neural Text-to-Speech (TTS) with conversational SSML prosody styling.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-apple-ink dark:text-white">Generative AI</td>
                  <td className="py-3 px-4">Microsoft Foundry / Azure OpenAI</td>
                  <td className="py-3 px-4">Structured JSON reasoning engine for real-time answer evaluation, contextual follow-up formulation, and diagnostic coaching report generation.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-apple-ink dark:text-white">Autonomous Agent</td>
                  <td className="py-3 px-4">Agent State Machine</td>
                  <td className="py-3 px-4">Multi-turn reactive lifecycle management, scheduled meeting clock enforcement, topic rotation heuristics, and weakness pre-seeding.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-apple-ink dark:text-white">Document Processing</td>
                  <td className="py-3 px-4">Serverless Resume Parser</td>
                  <td className="py-3 px-4">Serverless text extraction from PDF, DOCX, and TXT documents to ground interview questions directly in candidate credentials.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. End-to-End Core Functionality */}
        <section className="space-y-4">
          <h2 className="text-[22px] sm:text-[25px] font-bold tracking-tight text-apple-ink dark:text-white">
            4. End-to-End Core Functionality Demonstration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
              <h3 className="font-semibold text-[15px] text-apple-ink dark:text-white mb-1.5">
                Stage 1: Context &amp; Resume Grounding
              </h3>
              <p className="text-[13px] text-apple-inkMuted dark:text-white/70 leading-relaxed">
                Select target role, interview format (Technical, Behavioral, Mixed), meeting duration (10m, 20m, 30m), and optionally upload a resume to anchor inquiries in real engineering work.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
              <h3 className="font-semibold text-[15px] text-apple-ink dark:text-white mb-1.5">
                Stage 2: Live Verbal Rehearsal
              </h3>
              <p className="text-[13px] text-apple-inkMuted dark:text-white/70 leading-relaxed">
                Engage with the interviewer avatar across Idle, Listening, Thinking, and Speaking states. Voice input is transcribed in real time with dynamic follow-up scrutiny and an active countdown timer.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
              <h3 className="font-semibold text-[15px] text-apple-ink dark:text-white mb-1.5">
                Stage 3: Diagnostic Feedback
              </h3>
              <p className="text-[13px] text-apple-inkMuted dark:text-white/70 leading-relaxed">
                Receive qualitative scoring across Technical Answers, Communication, and Interview Handling, along with concrete strengths and actionable improvements.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
              <h3 className="font-semibold text-[15px] text-apple-ink dark:text-white mb-1.5">
                Stage 4: Targeted &ldquo;Rehearse Again&rdquo;
              </h3>
              <p className="text-[13px] text-apple-inkMuted dark:text-white/70 leading-relaxed">
                Click Rehearse Again to instantly launch a new rehearsal pre-seeded with your diagnosed weakness, driving closed-loop deliberate practice until mastery.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
