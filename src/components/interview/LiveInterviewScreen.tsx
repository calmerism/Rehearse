'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CandidateContext,
  InterviewSession,
  InterviewState,
  Question,
} from '@/types/interview';
import { AIInterviewerAvatar } from './AIInterviewerAvatar';
import { getSpeechService } from '@/services/speech/speechFactory';
import { getFoundryService } from '@/services/foundry/foundryFactory';
import { InterviewAgent, AgentEvent } from '@/agent/interviewAgent';
import { sessionStore } from '@/services/storage/sessionStore';
import { MockSpeechService } from '@/services/speech/mockSpeechService';
import { Video, VideoOff, Volume2, Check, Clock, Mic } from 'lucide-react';

interface LiveInterviewScreenProps {
  context: CandidateContext;
  onFinishInterview: (session: InterviewSession) => void;
  onAbort: () => void;
}

export const LiveInterviewScreen: React.FC<LiveInterviewScreenProps> = ({
  context,
  onFinishInterview,
  onAbort,
}) => {
  const [interviewState, setInterviewState] = useState<InterviewState>('thinking');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const agentRef = useRef<InterviewAgent | null>(null);
  const sessionRef = useRef<InterviewSession | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveMediaStreamRef = useRef<MediaStream | null>(null);

  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (liveMediaStreamRef.current) {
        liveMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        liveMediaStreamRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setErrorMessage('Camera is not supported on this browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        liveMediaStreamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        setErrorMessage('Camera access was denied or unavailable.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    }
  };

  // Automatically start candidate camera preview on mount
  useEffect(() => {
    let isCancelled = false;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        liveMediaStreamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.warn('[LiveInterviewScreen] Auto camera start not granted or unavailable:', err);
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (liveMediaStreamRef.current) {
        liveMediaStreamRef.current.getTracks().forEach((t) => t.stop());
        liveMediaStreamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (cameraActive && liveVideoRef.current && liveMediaStreamRef.current) {
      if (liveVideoRef.current.srcObject !== liveMediaStreamRef.current) {
        liveVideoRef.current.srcObject = liveMediaStreamRef.current;
        liveVideoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive]);

  const maxDurationSeconds = (context.durationMinutes || 10) * 60;
  const isConcludingRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Exact schedule enforcement: auto-conclude interview at exactly 10 minutes (or scheduled duration)
        if (next >= maxDurationSeconds && !isConcludingRef.current && agentRef.current) {
          const session = agentRef.current.getSession();
          if (session.status !== 'completed') {
            isConcludingRef.current = true;
            agentRef.current.concludeInterview(
              `We have reached our scheduled ${context.durationMinutes}-minute time limit. Thank you for your time and answers today. Generating your feedback report now.`
            );
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [context.durationMinutes, maxDurationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    let unmounted = false;

    // Immediately stop any leftover audio from lobby / preview / earlier rehearsals
    MockSpeechService.stopAllAudio();

    const initInterview = async () => {
      try {
        const speechService = await getSpeechService();
        if (unmounted) return;
        const foundryService = getFoundryService();
        if (unmounted) return;

        const newSession: InterviewSession = {
          id: `session_${Date.now()}`,
          createdAt: new Date().toISOString(),
          context,
          status: 'in_progress',
          currentQuestionIndex: 0,
          questions: [],
          answers: [],
          totalDurationSeconds: 0,
          isDemoMode: !foundryService.isRealAzure() || !speechService.isRealAzure(),
        };

        sessionRef.current = newSession;
        const agent = new InterviewAgent(newSession, foundryService, speechService);
        agentRef.current = agent;

        agent.on((event: AgentEvent) => {
          if (unmounted) return;

          switch (event.type) {
            case 'state_changed':
              setInterviewState(event.state);
              break;
            case 'question_asked':
              setCurrentQuestion(event.question);
              setCurrentTranscript('');
              setTypedAnswer('');
              setQuestionCount((prev) => agent.getSession().questions.length);
              break;
            case 'interim_transcript':
            case 'final_transcript':
              setCurrentTranscript(event.text);
              break;
            case 'interview_completed':
              if (sessionRef.current) {
                sessionRef.current.feedback = event.feedback;
                sessionRef.current.status = 'completed';
                sessionRef.current.totalDurationSeconds = elapsedSeconds;
                sessionStore.saveSession(sessionRef.current);
                onFinishInterview(sessionRef.current);
              }
              break;
            case 'error':
              setErrorMessage(event.message);
              setTimeout(() => setErrorMessage(null), 5000);
              break;
          }
        });

        await agent.start();
      } catch (err: any) {
        if (unmounted) return;
        console.error('[LiveInterview] Init error:', err);
        setErrorMessage('Failed to initialize rehearsal.');
      }
    };

    initInterview();

    return () => {
      unmounted = true;
      if (liveMediaStreamRef.current) {
        liveMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (agentRef.current) {
        agentRef.current.abort();
      }
      MockSpeechService.stopAllAudio();
    };
  }, [context]);

  const handleFinishSpeaking = async () => {
    if (!agentRef.current) return;
    const answerToSubmit = (typedAnswer || currentTranscript || '').trim();

    if (!answerToSubmit) {
      setErrorMessage("Please speak your response or use keyboard input.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setCurrentTranscript(answerToSubmit);
    await agentRef.current.submitAnswer(answerToSubmit);
    setTypedAnswer('');
    setCurrentTranscript('');
  };

  const handleEndInterviewEarly = async () => {
    if (isConcludingRef.current) return;
    isConcludingRef.current = true;
    if (!agentRef.current) {
      onAbort();
      return;
    }
    await agentRef.current.concludeInterview(
      'We will conclude our session here. Generating your feedback report.'
    );
  };

  const targetQuestions = context.durationMinutes >= 30 ? 15 : context.durationMinutes >= 20 ? 10 : 6;
  const isTimeNearEnd = elapsedSeconds >= maxDurationSeconds - 60;

  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col justify-between max-w-[1240px] mx-auto px-4 sm:px-8 py-2.5 sm:py-5">
      {/* Top Chrome: Apple Minimalist Navigation Bar */}
      <div className="flex items-center justify-between text-[12px] sm:text-[13px] py-2 sm:py-3 border-b border-black/[0.05] dark:border-white/[0.08] mb-2 sm:mb-4 gap-2">
        {/* Left: Role, Type Tag, Clock Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="font-semibold text-apple-ink dark:text-white truncate max-w-[140px] sm:max-w-none text-[13px] sm:text-[14px] tracking-tight">
            {context.role}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-apple-inkMuted dark:text-white/60 px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] shrink-0">
            {context.interviewType}
          </span>
          <div
            className={`flex items-center gap-1.5 font-mono text-[12px] px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
              isTimeNearEnd
                ? 'text-[#D05236] font-semibold bg-[#D05236]/10 border-[#D05236]/30'
                : 'text-apple-ink dark:text-white font-medium bg-black/[0.03] dark:bg-white/[0.06] border-black/[0.05] dark:border-white/[0.08]'
            }`}
          >
            <Clock className="w-3 h-3 text-apple-inkMuted dark:text-white/50" />
            <span>{formatTime(Math.min(elapsedSeconds, maxDurationSeconds))} / {context.durationMinutes}:00</span>
          </div>
        </div>

        {/* Right: Question Count, Camera Toggle, End Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="text-[12px] font-medium text-apple-inkMuted dark:text-white/70 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08]">
            Q{questionCount} of ~{targetQuestions}
          </span>

          <button
            onClick={handleToggleCamera}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all apple-action flex items-center gap-1.5 border ${
              cameraActive
                ? 'bg-black/[0.06] dark:bg-white/[0.12] text-apple-ink dark:text-white border-black/10 dark:border-white/15 shadow-sm'
                : 'bg-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-apple-inkMuted dark:text-white/60 border-black/[0.06] dark:border-white/[0.1]'
            }`}
            title={cameraActive ? 'Turn off camera self-view' : 'Turn on camera self-view'}
          >
            {cameraActive ? (
              <Video className="w-3.5 h-3.5 text-apple-ink dark:text-white" />
            ) : (
              <VideoOff className="w-3.5 h-3.5 text-apple-inkMuted dark:text-white/60" />
            )}
            <span>Camera</span>
          </button>

          <button
            onClick={handleEndInterviewEarly}
            className="px-3.5 py-1.5 text-[12px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.14] border border-red-500/20 rounded-full transition-all apple-action"
          >
            End
          </button>
        </div>
      </div>

      {/* Error notification if present */}
      {errorMessage && (
        <div className="my-1 p-2 text-center text-[13px] text-red-500 bg-red-500/5 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Center Stage: Interviewer Avatar, Candidate Video & Question */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-2 sm:my-4 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Video / Studio Presentation Surface */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-5 w-full">
          {/* AI Interviewer Studio Tile */}
          <div
            className={`transition-all duration-300 rounded-2xl sm:rounded-3xl bg-[#161618] dark:bg-[#111113] border border-black/10 dark:border-white/10 ring-1 ring-inset ring-white/[0.08] shadow-md relative overflow-hidden flex flex-col items-center justify-center ${
              cameraActive ? 'w-56 sm:w-80 h-36 sm:h-52' : 'w-64 sm:w-96 h-40 sm:h-60'
            }`}
          >
            <AIInterviewerAvatar state={interviewState} />

            <div className="absolute bottom-3 left-3.5 text-[11px] sm:text-[12px] font-medium text-white/90 tracking-tight flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-white/60" />
              <span>AI Interviewer</span>
            </div>

            <div className="absolute bottom-3 right-3.5">
              {interviewState === 'speaking' ? (
                <span className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#D05236]/20 text-[#ff8366] border border-[#D05236]/30">
                  Speaking
                </span>
              ) : interviewState === 'listening' ? (
                <span className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                  Listening
                </span>
              ) : interviewState === 'thinking' ? (
                <span className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-apple-amber-500/15 text-apple-amber-400 border border-apple-amber-500/25">
                  Evaluating
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-white/60">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Candidate Camera Tile (FaceTime / Studio Style) */}
          <AnimatePresence>
            {cameraActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="w-56 sm:w-80 h-36 sm:h-52 rounded-2xl sm:rounded-3xl bg-black border border-black/10 dark:border-white/10 ring-1 ring-inset ring-white/[0.08] overflow-hidden relative shadow-md group"
              >
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <div className="absolute bottom-3 left-3.5 text-[11px] sm:text-[12px] font-medium text-white/90 tracking-tight drop-shadow flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>You</span>
                </div>
                <button
                  onClick={handleToggleCamera}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hide camera self-view"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Question Text (SF Pro Display, comfortable measure, generous side padding) */}
        <div className="my-2 sm:my-4 min-h-[90px] sm:min-h-[110px] flex flex-col items-center justify-center w-full px-6 sm:px-12 md:px-16">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id || currentQuestion.text}
                initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-1 w-full max-w-3xl sm:max-w-4xl mx-auto"
              >
                <h2 className="text-xl sm:text-2xl md:text-[25px] font-medium sm:font-semibold tracking-[-0.02em] text-apple-ink dark:text-white leading-[1.45] sm:leading-[1.5] max-w-3xl mx-auto px-4 sm:px-8 text-center">
                  {currentQuestion.text.replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '').trim()}
                </h2>
              </motion.div>
            ) : (
              <motion.div
                key="preparing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[16px] text-apple-inkMuted font-normal py-4"
              >
                Preparing your rehearsal...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Candidate Speech Feedback (Real-time transcript stream) */}
          <AnimatePresence>
            {interviewState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="mt-3 w-full max-w-2xl mx-auto"
              >
                {currentTranscript ? (
                  <div className="px-5 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] text-center">
                    <p className="text-[14px] text-apple-ink/85 dark:text-white/85 italic leading-relaxed">
                      "{currentTranscript}"
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-[13px] text-apple-inkMuted dark:text-white/50 py-1">
                    <Mic className="w-3.5 h-3.5 text-[#D05236]" />
                    <span>Listening to your response...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Stage: Restrained Apple Audio Action */}
      <div className="w-full max-w-md mx-auto space-y-3.5 pb-4 text-center">
        {/* Primary Voice Action Button */}
        <div className="flex items-center justify-center min-h-[44px]">
          <AnimatePresence mode="wait">
            {interviewState === 'listening' ? (
              <motion.button
                key="finish-btn"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={handleFinishSpeaking}
                className="px-6 py-2.5 rounded-full bg-[#D05236] hover:bg-[#b8432a] active:scale-[0.98] text-white text-[14px] font-semibold tracking-tight shadow-sm transition-all apple-action flex items-center gap-2 mx-auto"
              >
                <Check className="w-4 h-4" />
                <span>Finish Speaking</span>
              </motion.button>
            ) : (
              <motion.div
                key="status-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-4 py-2 text-[13px] sm:text-[14px] text-apple-inkMuted flex items-center justify-center gap-2"
              >
                {interviewState === 'speaking' ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#D05236]" />
                    <span>Interviewer is speaking...</span>
                  </>
                ) : (
                  <span>Evaluating response...</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary Utilities (Text Input in Apple style) */}
        <div className="flex items-center justify-center text-[12px] text-apple-inkMuted">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
          >
            {showManualInput ? 'Hide Keyboard' : 'Type Response'}
          </button>
        </div>

        {/* Keyboard Input Field with spring expansion */}
        <AnimatePresence>
          {showManualInput && (
            <motion.div
              key="manual-input-box"
              initial={{ opacity: 0, height: 0, y: 6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-2 pt-1 overflow-hidden"
            >
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishSpeaking();
                }}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-2 text-[15px] sm:text-[14px] bg-white dark:bg-[#212121] apple-hairline rounded-full focus:outline-none"
              />
              <button
                onClick={handleFinishSpeaking}
                className="px-5 py-2 rounded-full bg-[#D05236] hover:bg-[#b8432a] text-white text-[13px] font-semibold apple-action"
              >
                Send
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
