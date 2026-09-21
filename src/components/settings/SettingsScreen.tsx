'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPreferences } from '@/types/interview';
import { sessionStore } from '@/services/storage/sessionStore';
import { MockSpeechService } from '@/services/speech/mockSpeechService';

interface SettingsScreenProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isDemoMode: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  theme,
  onToggleTheme,
  isDemoMode,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    sessionStore.getPreferences()
  );
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

  React.useEffect(() => {
    MockSpeechService.getAvailableVoices().then((voices) => {
      const roboticNames = [
        'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
        'deranged', 'fred', 'good news', 'hysterical', 'junior', 'kathy',
        'organ', 'ralph', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
        'jester', 'pipe organ', 'victor'
      ];
      const natural = voices.filter(
        (v) =>
          v.lang.startsWith('en') &&
          !roboticNames.some((r) => v.name.toLowerCase().includes(r))
      );
      setSystemVoices(natural);
    });
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
        `Hello! I will be your interviewer for today's rehearsal. Whenever you're ready, let's begin.`,
        (isSpeaking) => {
          if (!isSpeaking) setIsPreviewingVoice(false);
        }
      )
      .finally(() => {
        setIsPreviewingVoice(false);
      });
  };

  const handleUpdate = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = sessionStore.savePreferences({ [key]: value });
    setPreferences(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 sm:px-6 pt-5 pb-12 sm:pt-12 sm:pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 animate-apple-in">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.028em] text-apple-ink dark:text-white">
          Settings
        </h1>

        <AnimatePresence>
          {savedFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="text-[13px] text-apple-amber-500 font-medium"
            >
              ✓ Settings saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Speech & Audio Group */}
        <div className="animate-apple-in apple-stagger-1">
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-1">
            Speech & Audio
          </h2>
          <div className="space-y-0.5">
            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Interviewer Neural Voice
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  Conversational HD speech synthesis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={preferences.voiceName || 'Auto (Best Natural)'}
                  onChange={(e) => handleUpdate('voiceName', e.target.value)}
                  className="text-[13px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-apple-ink dark:text-white px-3 py-1.5 rounded-lg apple-hairline focus:outline-none focus:ring-1 focus:ring-apple-amber-500 cursor-pointer max-w-[220px] sm:max-w-[260px] truncate"
                >
                  <option value="Auto (Best Natural)">Auto (Recommended: Jenny Neural)</option>
                  <optgroup label="Microsoft Azure Neural (Studio HD)">
                    <option value="en-US-JennyNeural">Jenny (Warm & Conversational)</option>
                    <option value="en-US-GuyNeural">Guy (Professional & Articulate)</option>
                    <option value="en-US-AriaNeural">Aria (Dynamic & Natural)</option>
                    <option value="en-US-DavisNeural">Davis (Calm & Authoritative)</option>
                    <option value="en-US-AvaMultilingualNeural">Ava (Modern & Friendly)</option>
                    <option value="en-US-AndrewMultilingualNeural">Andrew (Clear & Dynamic)</option>
                    <option value="en-GB-SoniaNeural">Sonia (British, Polished)</option>
                    <option value="en-GB-RyanNeural">Ryan (British, Natural)</option>
                  </optgroup>
                  {systemVoices.length > 0 && (
                    <optgroup label="Device System Voices">
                      {systemVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <button
                  type="button"
                  onClick={handlePreviewVoice}
                  disabled={isPreviewingVoice}
                  className="px-3 py-1.5 rounded-lg bg-apple-amber-500/10 hover:bg-apple-amber-500/20 text-apple-amber-500 text-[12px] font-semibold transition-colors apple-action shrink-0 flex items-center gap-1"
                  title="Listen to sample voice"
                >
                  {isPreviewingVoice ? (
                    <>
                      <span className="w-2.5 h-2.5 border-2 border-apple-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Playing</span>
                    </>
                  ) : (
                    <>
                      <span>▶</span>
                      <span>Preview</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Force Demo Mode
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  Use browser Web Speech API and mock engine
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.forceDemoMode}
                onClick={() => handleUpdate('forceDemoMode', !preferences.forceDemoMode)}
                className={`w-[46px] h-[26px] rounded-full p-[2px] transition-colors duration-200 relative flex items-center apple-action shrink-0 ${
                  preferences.forceDemoMode ? 'bg-apple-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <motion.span
                  animate={{ x: preferences.forceDemoMode ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="w-[22px] h-[22px] rounded-full bg-white shadow-sm pointer-events-none"
                />
              </button>
            </div>
          </div>
        </div>


        {/* Azure AI-103 Services Status */}
        <div className="animate-apple-in apple-stagger-2">
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-1">
            Azure AI-103 Architecture Status
          </h2>
          <div className="space-y-0.5">
            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Azure AI Speech Service
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  {isDemoMode ? 'Browser Web Speech API (Local Fallback)' : 'Azure Cognitive Speech (24kHz Neural TTS & STT)'}
                </span>
              </div>
              <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${isDemoMode ? 'bg-neutral-100 dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                {isDemoMode ? 'Fallback Active' : 'Connected'}
              </span>
            </div>

            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Microsoft Foundry &amp; OpenAI
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  {isDemoMode ? 'Mock Foundry Reasoning Engine (Contextual Heuristics)' : 'Microsoft Foundry GPT-4o Model Deployment'}
                </span>
              </div>
              <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${isDemoMode ? 'bg-neutral-100 dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                {isDemoMode ? 'Fallback Active' : 'Connected'}
              </span>
            </div>

            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Autonomous Interview Agent
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  State machine, duration clock &amp; topic rotation
                </span>
              </div>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Operational
              </span>
            </div>

            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Resume Document Parser
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  PDF &amp; DOCX serverless extraction
                </span>
              </div>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* Display Group */}
        <div className="animate-apple-in apple-stagger-3">
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white mb-1">
            Display & Accessibility
          </h2>
          <div className="space-y-0.5">
            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Theme
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                onClick={onToggleTheme}
                className="text-[13px] text-apple-amber-500 hover:underline apple-action"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            <div className="py-3 px-3 -mx-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors flex items-center justify-between">
              <div>
                <span className="text-[15px] text-apple-ink dark:text-white block font-medium">
                  Reduced Motion
                </span>
                <span className="text-[13px] text-apple-inkMuted">
                  Subdued cross-fades instead of spring motion
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.reducedMotion}
                onClick={() => handleUpdate('reducedMotion', !preferences.reducedMotion)}
                className={`w-[46px] h-[26px] rounded-full p-[2px] transition-colors duration-200 relative flex items-center apple-action shrink-0 ${
                  preferences.reducedMotion ? 'bg-apple-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <motion.span
                  animate={{ x: preferences.reducedMotion ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="w-[22px] h-[22px] rounded-full bg-white shadow-sm pointer-events-none"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
