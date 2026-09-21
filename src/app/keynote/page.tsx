'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Home, Sun, Moon } from 'lucide-react';

interface SlideData {
  id: string;
  tag: string;
  headline: string;
  subhead?: string;
  content: React.ReactNode;
}

export default function KeynotePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const slides: SlideData[] = [
    // Slide 1: Title
    {
      id: 'title',
      tag: 'Azure AI-103 Final Project • Chitkara University',
      headline: 'Rehearse.',
      subhead: 'Practice the interview, not just the questions.',
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 pt-4">
          <p className="text-[17px] sm:text-[20px] text-neutral-400 dark:text-neutral-400 font-normal max-w-xl text-center leading-relaxed">
            An autonomous, real-time conversational partner for technical and system design interviews.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
              Azure AI Speech
            </span>
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
              Microsoft Foundry GPT-4o
            </span>
            <span className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
              Autonomous Agent FSM
            </span>
          </div>
        </div>
      ),
    },

    // Slide 2: The Problem
    {
      id: 'problem',
      tag: 'The Placement Challenge',
      headline: 'Memorizing answers fails in live interviews.',
      subhead: 'Static prep tests syntax. Real interviewers test verbal reasoning.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between">
            <div className="text-[13px] font-semibold tracking-wider uppercase text-neutral-400">LeetCode & Flashcards</div>
            <div className="text-[20px] font-semibold text-neutral-800 dark:text-neutral-100 mt-3">Syntax in isolation</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2">Memorizes data structures with zero verbal communication or spoken friction.</div>
          </div>
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between">
            <div className="text-[13px] font-semibold tracking-wider uppercase text-neutral-400">Mock Questionnaires</div>
            <div className="text-[20px] font-semibold text-neutral-800 dark:text-neutral-100 mt-3">Static & non-adaptive</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2">Cannot challenge shallow answers, interrupt, or probe missing trade-offs.</div>
          </div>
          <div className="p-6 rounded-2xl border border-[#D05236]/30 bg-[#D05236]/[0.04] flex flex-col justify-between">
            <div className="text-[13px] font-semibold tracking-wider uppercase text-[#D05236]">Real Interviews</div>
            <div className="text-[20px] font-semibold text-neutral-800 dark:text-neutral-100 mt-3">High conversational scrutiny</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2">Candidates freeze when forced to defend architectural decisions under pressure.</div>
          </div>
        </div>
      ),
    },

    // Slide 3: The Big Question
    {
      id: 'quote',
      tag: 'Live Conversational Friction',
      headline: '“Why did you choose PostgreSQL over MongoDB?”',
      subhead: 'Candidates struggle not from a lack of technical knowledge, but from zero verbal practice defending trade-offs.',
      content: (
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 text-[14px] font-medium text-neutral-600 dark:text-neutral-300">
            <span>What happens if traffic scales by 100x?</span>
            <span className="text-[#D05236]">→</span>
            <span>How do you handle schema drift?</span>
          </div>
        </div>
      ),
    },

    // Slide 4: The Solution
    {
      id: 'solution',
      tag: 'The Product Engine',
      headline: 'An active, adaptive conversational partner.',
      subhead: 'Rehearse listens, challenges your claims in real time, and drives deliberate practice.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[36px] font-bold text-[#D05236]">01</div>
            <div className="text-[18px] font-semibold text-neutral-800 dark:text-neutral-100 mt-2">Spoken Dialogue</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Continuous STT voice recognition and studio 24kHz neural audio streaming replace artificial text chats.
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[36px] font-bold text-[#D05236]">02</div>
            <div className="text-[18px] font-semibold text-neutral-800 dark:text-neutral-100 mt-2">Dynamic Scrutiny</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              The AI inspects candidate claims, detecting specific technologies to challenge system trade-offs.
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[36px] font-bold text-[#D05236]">03</div>
            <div className="text-[18px] font-semibold text-neutral-800 dark:text-neutral-100 mt-2">Continuity Loop</div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Diagnostic scoring extracts priority gaps; &ldquo;Rehearse Again&rdquo; pre-seeds weaknesses into subsequent prompts.
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Azure AI-103 Architecture
    {
      id: 'ai103',
      tag: 'Microsoft Azure Services (25% Weight)',
      headline: 'Four core Azure AI pillars applied.',
      subhead: 'Production cloud architecture with dual-layer offline fallback resilience.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 max-w-6xl mx-auto w-full">
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#D05236]">Speech Services</div>
            <div className="text-[17px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">Azure AI Speech</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Real-time STT speech capture &amp; 24kHz 160kbps Neural TTS with SSML conversational prosody.
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#D05236]">Generative Reasoning</div>
            <div className="text-[17px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">Microsoft Foundry</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              GPT-4o deployment enforcing structured JSON schemas for real-time question generation &amp; scoring.
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#D05236]">Agent Orchestration</div>
            <div className="text-[17px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">State Machine FSM</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Clock duration pacing (10m, 20m, 30m) and 5-pillar topic rotation to eliminate repetitive questions.
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#D05236]">Document Processing</div>
            <div className="text-[17px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">Resume Ingestion</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Serverless PDF and DOCX text extraction to anchor inquiries directly in candidate projects.
            </div>
          </div>
        </div>
      ),
    },

    // Slide 6: The 5-Step Demo Flow
    {
      id: 'demoflow',
      tag: '2-Minute Technical Demonstration Flow',
      headline: 'The end-to-end rehearsal lifecycle.',
      subhead: 'Follow this exact sequence on getrehearse.vercel.app during your live evaluation.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-6 max-w-6xl mx-auto w-full text-center">
          <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between h-[160px]">
            <div className="text-[12px] font-semibold text-[#D05236]">15 SEC</div>
            <div className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">Setup &amp; Resume</div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">Select role, 10 min, load sample resume.</div>
          </div>
          <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between h-[160px]">
            <div className="text-[12px] font-semibold text-[#D05236]">15 SEC</div>
            <div className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">Lobby Calibration</div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">Microphone check &amp; studio voice preview.</div>
          </div>
          <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between h-[160px]">
            <div className="text-[12px] font-semibold text-[#D05236]">30 SEC</div>
            <div className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">Spoken Answer</div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">AI speaks question; candidate talks into mic.</div>
          </div>
          <div className="p-4 rounded-xl border border-[#D05236]/40 bg-[#D05236]/[0.04] flex flex-col justify-between h-[160px]">
            <div className="text-[12px] font-semibold text-[#D05236]">30 SEC</div>
            <div className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">Adaptive Scrutiny</div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">AI challenges PostgreSQL vs NoSQL &amp; 100x scale.</div>
          </div>
          <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] flex flex-col justify-between h-[160px]">
            <div className="text-[12px] font-semibold text-[#D05236]">30 SEC</div>
            <div className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">Rehearse Again</div>
            <div className="text-[12px] text-neutral-500 dark:text-neutral-400">Review 3-axis score &amp; pre-seed priority gap.</div>
          </div>
        </div>
      ),
    },

    // Slide 7: Engineering Rigor & Responsible AI
    {
      id: 'rigor',
      tag: 'Testing & Responsible AI (15% Weight)',
      headline: 'Engineered for reliability, privacy, and trust.',
      subhead: 'Slide 6 compliance: verified code quality, complete explainability, and privacy by design.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto w-full text-center">
          <div className="p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[44px] font-extrabold text-emerald-500">25 / 25</div>
            <div className="text-[16px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">Automated Tests Passing</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
              Validating agent lifecycle, topic rotation, non-resume scenarios, and UI click handlers.
            </div>
          </div>
          <div className="p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[44px] font-extrabold text-[#D05236]">100%</div>
            <div className="text-[16px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">Client-Side Video Privacy</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
              Camera feed operates strictly in browser memory via getUserMedia. Zero video uploaded to servers.
            </div>
          </div>
          <div className="p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
            <div className="text-[44px] font-extrabold text-sky-500">0</div>
            <div className="text-[16px] font-bold text-neutral-800 dark:text-neutral-100 mt-2">TypeScript Compilation Errors</div>
            <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
              Clean npx tsc --noEmit check with strict type safety across all service boundaries.
            </div>
          </div>
        </div>
      ),
    },

    // Slide 8: Conclusion & Viva
    {
      id: 'conclusion',
      tag: 'Chitkara University • Final Evaluation',
      headline: 'Rehearse before the real interview.',
      subhead: 'Live at getrehearse.vercel.app',
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 pt-6">
          <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] max-w-lg text-center">
            <div className="text-[18px] font-bold text-neutral-800 dark:text-neutral-100">
              Ready for Class Presentation &amp; Viva Defense
            </div>
            <div className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              24 – 25 September 2026 • Full code explainability across Azure Speech, Microsoft Foundry, and autonomous agent orchestration.
            </div>
          </div>
          <a
            href="https://getrehearse.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-full bg-[#D05236] hover:bg-[#C2492F] text-white font-semibold text-[15px] tracking-tight transition-all shadow-sm"
          >
            Open Live Application
          </a>
        </div>
      ),
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlide];

  return (
    <div className={`fixed inset-0 w-screen h-screen flex flex-col justify-between overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0B0B0D] text-white' : 'bg-[#FAFAFC] text-[#1D1D1F]'}`}>
      {/* Top Chrome Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[12px] font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Rehearse App</span>
          </Link>
          <span className="text-[12px] text-neutral-400 hidden sm:inline">
            Use <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">→</kbd> to navigate
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono tracking-tight text-neutral-400">
            {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>

          <button
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Toggle theme (T)"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Stage (Keynote Viewport) */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 max-w-6xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center text-center space-y-4"
          >
            {/* Category Eyebrow */}
            <div className="text-[12px] sm:text-[13px] font-semibold tracking-wider uppercase text-[#D05236]">
              {slide.tag}
            </div>

            {/* Main Headline */}
            <h1 className="text-[32px] sm:text-[48px] md:text-[56px] font-bold tracking-[-0.035em] text-neutral-900 dark:text-white leading-[1.08] max-w-4xl">
              {slide.headline}
            </h1>

            {/* Subhead if present */}
            {slide.subhead && (
              <p className="text-[16px] sm:text-[19px] text-neutral-500 dark:text-neutral-400 max-w-2xl font-normal leading-relaxed">
                {slide.subhead}
              </p>
            )}

            {/* Slide Body Content */}
            <div className="w-full pt-2">
              {slide.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation & Progress Bar */}
      <footer className="w-full px-6 py-6 flex flex-col items-center gap-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-6 bg-[#D05236]'
                    : 'w-1.5 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thin bottom progress line */}
        <div className="w-full max-w-md h-0.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D05236] transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
