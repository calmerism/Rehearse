'use client';

import React from 'react';
import { InterviewState } from '@/types/interview';

interface AIInterviewerAvatarProps {
  state: InterviewState;
  interimTranscript?: string;
  compact?: boolean;
}

export const AIInterviewerAvatar: React.FC<AIInterviewerAvatarProps> = ({ state }) => {
  return (
    <div className="relative flex items-center justify-center select-none w-full h-full py-4">
      {state === 'speaking' ? (
        /* Speaking: Multi-band Apple acoustic waveform with soft warm bloom */
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-[#D05236]/10 blur-xl pointer-events-none" />
          <div className="relative flex items-center justify-center gap-1.5 h-12">
            <span
              className="w-1 h-3.5 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.75s ease-in-out 0ms infinite' }}
            />
            <span
              className="w-1 h-6 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.65s ease-in-out 140ms infinite' }}
            />
            <span
              className="w-1.5 h-9 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.85s ease-in-out 280ms infinite' }}
            />
            <span
              className="w-1.5 h-11 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.7s ease-in-out 70ms infinite' }}
            />
            <span
              className="w-1.5 h-9 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.9s ease-in-out 350ms infinite' }}
            />
            <span
              className="w-1 h-6 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.6s ease-in-out 210ms infinite' }}
            />
            <span
              className="w-1 h-3.5 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleAcousticWave 0.8s ease-in-out 420ms infinite' }}
            />
          </div>
        </div>
      ) : state === 'listening' ? (
        /* Listening: Attentive acoustic presence */
        <div className="relative flex items-center justify-center">
          <div className="relative flex items-center justify-center gap-1.5 h-10">
            <span
              className="w-1 h-3 bg-white/30 rounded-full origin-center"
              style={{ animation: 'appleListeningWave 1.4s ease-in-out 0ms infinite' }}
            />
            <span
              className="w-1 h-5 bg-[#D05236]/70 rounded-full origin-center"
              style={{ animation: 'appleListeningWave 1.4s ease-in-out 200ms infinite' }}
            />
            <span
              className="w-1.5 h-7 bg-[#D05236] rounded-full origin-center"
              style={{ animation: 'appleListeningWave 1.4s ease-in-out 400ms infinite' }}
            />
            <span
              className="w-1 h-5 bg-[#D05236]/70 rounded-full origin-center"
              style={{ animation: 'appleListeningWave 1.4s ease-in-out 200ms infinite' }}
            />
            <span
              className="w-1 h-3 bg-white/30 rounded-full origin-center"
              style={{ animation: 'appleListeningWave 1.4s ease-in-out 0ms infinite' }}
            />
          </div>
        </div>
      ) : state === 'thinking' ? (
        /* Thinking / Evaluating: Dual concentric neural resonance */
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full border-[1.5px] border-white/10 border-t-[#D05236]"
            style={{ animation: 'appleNeuralSpin 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite' }}
          />
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-[#D05236]"
            style={{ animation: 'appleNeuralCoreBreath 1.8s ease-in-out infinite' }}
          />
        </div>
      ) : (
        /* Idle / Ready: Calm resting horizon */
        <div className="flex items-center justify-center gap-1.5 h-6 opacity-30">
          <span className="w-1 h-2 bg-white rounded-full" />
          <span className="w-1 h-4 bg-white rounded-full" />
          <span className="w-1 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
};
