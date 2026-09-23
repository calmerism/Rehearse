'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateContext } from '@/types/interview';
import { sessionStore } from '@/services/storage/sessionStore';
import { MockSpeechService } from '@/services/speech/mockSpeechService';

interface InterviewLobbyProps {
  context: CandidateContext;
  onStartInterview: () => void;
  onBackToSetup: () => void;
}

export const InterviewLobby: React.FC<InterviewLobbyProps> = ({
  context,
  onStartInterview,
  onBackToSetup,
}) => {
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [activeVoiceName, setActiveVoiceName] = useState('Jenny Neural (Azure HD)');
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const prefs = sessionStore.getPreferences();
    const azureVoiceLabels: Record<string, string> = {
      'en-US-JennyNeural': 'Jenny Neural (Warm & Natural)',
      'en-US-GuyNeural': 'Guy Neural (Professional)',
      'en-US-AriaNeural': 'Aria Neural (Dynamic)',
      'en-US-DavisNeural': 'Davis Neural (Articulate)',
      'en-US-AvaMultilingualNeural': 'Ava Neural (Modern)',
      'en-US-AndrewMultilingualNeural': 'Andrew Neural (Clear)',
      'en-GB-SoniaNeural': 'Sonia Neural (British)',
      'en-GB-RyanNeural': 'Ryan Neural (British)',
    };

    if (prefs.voiceName && azureVoiceLabels[prefs.voiceName]) {
      setActiveVoiceName(azureVoiceLabels[prefs.voiceName]);
    } else if (!prefs.voiceName || prefs.voiceName.includes('Auto')) {
      setActiveVoiceName('Jenny Neural (Azure HD)');
    }
    return () => {
      MockSpeechService.stopAllAudio();
    };
  }, []);

  const handlePreviewVoice = () => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    const speech = new MockSpeechService();
    speech
      .speak(
        `Hi! I will be your interviewer for today's ${context.role} rehearsal. Let's begin whenever you're ready.`,
        (isSpeaking) => {
          if (!isSpeaking) setIsPreviewingVoice(false);
        }
      )
      .finally(() => {
        setIsPreviewingVoice(false);
      });
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micStreamRef.current = stream;
          setMicActive(true);
        })
        .catch(() => setMicActive(false));
    }
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setCameraActive(false);
      setCameraError(null);
    } else {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera is not supported on this browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        mediaStreamRef.current = stream;
        setCameraActive(true);
      } catch (err: any) {
        console.warn('[Lobby] Camera unavailable:', err);
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission denied. Please allow camera access in your browser.'
            : 'Unable to access camera. Please check your camera permissions.'
        );
      }
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch((e) => console.warn('Autoplay error:', e));
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-[540px] mx-auto px-4 sm:px-6 pt-5 pb-12 sm:pt-14 sm:pb-20 text-center animate-apple-in relative z-20">
      {/* Navigation Breadcrumb */}
      <div className="flex justify-start mb-3 sm:mb-5">
        <button
          onClick={onBackToSetup}
          className="text-[13px] text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
        >
          ‹ Interview Setup
        </button>
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl sm:text-[34px] font-semibold tracking-[-0.028em] text-apple-ink dark:text-white leading-tight mb-4 sm:mb-6">
        Your rehearsal is ready.
      </h1>

      {/* Unified Apple Row Table without card enclosure */}
      <div className="space-y-1 text-left animate-apple-in apple-stagger-1">
        {context.isSampleDemo && (
          <div className="py-2 px-3 -mx-3 rounded-xl flex items-center justify-between text-[14px] bg-[#D05236]/[0.06] dark:bg-[#D05236]/[0.12] mb-1">
            <span className="text-[#D05236] dark:text-[#E06646] font-medium">Demo Preset</span>
            <span className="font-semibold text-[#D05236] dark:text-[#E06646] text-[13px]">
              5 Questions & Answers • Sample Document
            </span>
          </div>
        )}

        {/* Row 1: Role */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <span className="text-apple-inkMuted text-[14px]">Role</span>
          <span className="font-medium text-apple-ink dark:text-white">{context.role}</span>
        </div>

        {/* Row 2: Company (if provided) */}
        {context.company && (
          <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
            <span className="text-apple-inkMuted text-[14px]">Company</span>
            <span className="font-medium text-apple-ink dark:text-white">{context.company}</span>
          </div>
        )}

        {/* Row 3: Interview Type */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <span className="text-apple-inkMuted text-[14px]">Interview Type</span>
          <span className="font-medium text-apple-ink dark:text-white capitalize">{context.interviewType}</span>
        </div>

        {/* Row 4: Duration */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <span className="text-apple-inkMuted text-[14px]">Duration</span>
          <span className="font-medium text-apple-ink dark:text-white">{context.durationMinutes} minutes</span>
        </div>

        {/* Row 5: Microphone Status */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <div>
            <span className="text-apple-inkMuted text-[14px] block">Microphone</span>
            <span className="text-[12px] text-apple-inkMuted/70">
              {micActive ? 'Active and capturing voice' : 'Detecting audio input...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                micActive
                  ? 'bg-[#31805A] shadow-[0_0_8px_rgba(49,128,90,0.6)]'
                  : 'bg-apple-inkMuted'
              }`}
            />
            <span className="text-[13px] text-apple-ink dark:text-white font-medium">
              {micActive ? 'Ready' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Row 6: Interviewer Voice */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <div className="min-w-0 pr-2">
            <span className="text-apple-inkMuted text-[14px] block">Interviewer Voice</span>
            <span className="text-[12px] text-apple-inkMuted/70 truncate block max-w-[200px] sm:max-w-[280px]">
              {activeVoiceName}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePreviewVoice}
            disabled={isPreviewingVoice}
            className="text-[13px] font-medium text-apple-amber-500 hover:underline apple-action shrink-0 flex items-center gap-1"
          >
            {isPreviewingVoice ? (
              <>
                <span className="w-2.5 h-2.5 border-2 border-apple-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Speaking...</span>
              </>
            ) : (
              'Preview Voice'
            )}
          </button>
        </div>

        {/* Row 7: Camera Toggle */}
        <div className="py-2.5 px-3 -mx-3 rounded-xl flex items-center justify-between text-[15px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
          <span className="text-apple-inkMuted text-[14px]">Camera Self-Preview</span>
          <button
            onClick={handleToggleCamera}
            className="text-[13px] font-medium text-apple-amber-500 hover:underline apple-action"
          >
            {cameraActive ? 'Turn Off' : 'Preview'}
          </button>
        </div>
      </div>

      {cameraError && (
        <p className="mt-3 p-2.5 text-[13px] text-red-500 bg-red-500/10 rounded-xl text-center">
          {cameraError}
        </p>
      )}

      {/* Video Preview if toggled with Apple Spring Expansion */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="mt-4 aspect-video rounded-[16px] overflow-hidden bg-black apple-hairline shadow-lg"
          >
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && mediaStreamRef.current) {
                  el.srcObject = mediaStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Action Button (Apple Pill per DESIGN.md: 11px x 22px, font 15px) */}
      <div className="mt-8 flex justify-center animate-apple-in apple-stagger-2 relative z-30">
        <button
          onClick={() => {
            if (isStarting) return;
            setIsStarting(true);
            MockSpeechService.warmUpAudioContext();

            // Cleanly release mic and camera preview before starting live session
            if (micStreamRef.current) {
              micStreamRef.current.getTracks().forEach((t) => t.stop());
              micStreamRef.current = null;
            }
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((t) => t.stop());
              mediaStreamRef.current = null;
            }

            // Stop any preview speech immediately so it never overlaps with the interview!
            MockSpeechService.stopAllAudio();
            setIsPreviewingVoice(false);

            // Safety timeout to prevent permanent button lock if navigation is delayed
            setTimeout(() => {
              setIsStarting(false);
            }, 6000);

            onStartInterview();
          }}
          disabled={isStarting}
          className="px-8 py-2.5 rounded-full bg-apple-amber-500 hover:bg-apple-amber-600 text-white text-[15px] font-semibold tracking-tight transition-all apple-action shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {isStarting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Starting Rehearsal...</span>
            </>
          ) : (
            'Start Interview'
          )}
        </button>
      </div>
    </div>
  );
};
