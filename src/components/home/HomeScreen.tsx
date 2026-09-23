'use client';

import React from 'react';
import { InterviewSession } from '@/types/interview';

interface HomeScreenProps {
  onStartRehearsal: (focusArea?: string) => void;
  onViewHistory: () => void;
  onStartSampleDemo?: () => void;
  latestSession?: InterviewSession | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartRehearsal,
  onViewHistory,
  onStartSampleDemo,
}) => {
  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-10">
      <div className="max-w-[780px] mx-auto text-center flex flex-col items-center">
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

        {onStartSampleDemo && (
          <div className="mt-5 sm:mt-6 animate-apple-in apple-stagger-3">
            <button
              onClick={onStartSampleDemo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-apple-inkMuted dark:text-white/70 hover:text-apple-ink dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.10] border border-black/5 dark:border-white/10 transition-all apple-action cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#D05236]" />
              <span>Sample Demo: 5-Question Behavioral</span>
              <span className="text-[12px] opacity-60">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
