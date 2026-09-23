'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { HomeScreen } from '@/components/home/HomeScreen';
import { InterviewSetupModal } from '@/components/setup/InterviewSetupModal';
import { InterviewLobby } from '@/components/lobby/InterviewLobby';
import { LiveInterviewScreen } from '@/components/interview/LiveInterviewScreen';
import { FeedbackReport } from '@/components/feedback/FeedbackReport';
import { RehearsalHistoryScreen } from '@/components/history/RehearsalHistoryScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { CandidateContext, InterviewSession } from '@/types/interview';
import { sessionStore, SAMPLE_DEMO_RESUME_TEXT } from '@/services/storage/sessionStore';

export type ScreenState = 'home' | 'lobby' | 'live_interview' | 'feedback';

export default function Page() {
  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'settings'>('home');
  const [screenState, setScreenState] = useState<ScreenState>('home');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupFocusArea, setSetupFocusArea] = useState<string | undefined>(undefined);
  const [setupInitialContext, setSetupInitialContext] = useState<Partial<CandidateContext> | null>(null);
  const [activeContext, setActiveContext] = useState<CandidateContext | null>(null);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Initialize theme & load sessions
  useEffect(() => {
    try {
      localStorage.removeItem('rehearse_preferences_v1');
      localStorage.removeItem('rehearse_preferences_v2');
    } catch {}

    const prefs = sessionStore.getPreferences();
    const effectiveTheme = prefs.theme === 'dark' ? 'dark' : 'light';
    setTheme(effectiveTheme);
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const sessions = sessionStore.getAllSessions();
    setAllSessions(sessions);

    // Check if real Azure keys are present on server
    fetch('/api/speech/token')
      .then((res) => res.json())
      .then((data) => {
        setIsDemoMode(!!data.mock || prefs.forceDemoMode);
      })
      .catch(() => setIsDemoMode(true));
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    sessionStore.savePreferences({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleStartRehearsalClick = (contextOrFocus?: Partial<CandidateContext> | string) => {
    if (typeof contextOrFocus === 'string') {
      setSetupInitialContext({ focusArea: contextOrFocus });
      setSetupFocusArea(contextOrFocus);
    } else if (contextOrFocus) {
      setSetupInitialContext(contextOrFocus);
      setSetupFocusArea(contextOrFocus.focusArea);
    } else {
      setSetupInitialContext(null);
      setSetupFocusArea(undefined);
    }
    setIsSetupOpen(true);
  };

  const handleProceedToLobby = (context: CandidateContext) => {
    setActiveContext(context);
    setIsSetupOpen(false);
    setCurrentTab('home');
    setScreenState('lobby');
  };

  const handleStartSampleDemo = () => {
    const demoContext: CandidateContext = {
      role: 'Software Engineer',
      company: 'TechCorp Solutions',
      interviewType: 'behavioural',
      durationMinutes: 10,
      targetQuestions: 5,
      isSampleDemo: true,
      resumeText: SAMPLE_DEMO_RESUME_TEXT,
    };
    setActiveContext(demoContext);
    setIsSetupOpen(false);
    setCurrentTab('home');
    setScreenState('lobby');
  };

  const handleStartLiveInterview = () => {
    setScreenState('live_interview');
  };

  const handleFinishLiveInterview = (completedSession: InterviewSession) => {
    setActiveSession(completedSession);
    setAllSessions(sessionStore.getAllSessions());
    setScreenState('feedback');
  };

  const handleRehearseAgain = (contextOrFocus: Partial<CandidateContext> | string) => {
    if (typeof contextOrFocus === 'string') {
      setSetupInitialContext({ focusArea: contextOrFocus });
      setSetupFocusArea(contextOrFocus);
    } else {
      setSetupInitialContext(contextOrFocus);
      setSetupFocusArea(contextOrFocus.focusArea);
    }
    setIsSetupOpen(true);
  };

  const handleBackToHome = () => {
    setScreenState('home');
    setCurrentTab('home');
    setAllSessions(sessionStore.getAllSessions());
  };

  const latestSession = allSessions.length > 0 ? allSessions[0] : null;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'history') {
            setAllSessions(sessionStore.getAllSessions());
          }
          setCurrentTab(tab);
          if (tab === 'home' && screenState !== 'live_interview') {
            setScreenState('home');
          }
        }}
        isDemoMode={isDemoMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1">
        {currentTab === 'history' && (
          <RehearsalHistoryScreen
            sessions={allSessions}
            onStartRehearsal={handleStartRehearsalClick}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            theme={theme}
            onToggleTheme={handleToggleTheme}
            isDemoMode={isDemoMode}
          />
        )}

        {currentTab === 'home' && (
          <>
            {screenState === 'home' && (
              <HomeScreen
                onStartRehearsal={handleStartRehearsalClick}
                onViewHistory={() => setCurrentTab('history')}
                onStartSampleDemo={handleStartSampleDemo}
                latestSession={latestSession}
              />
            )}

            {screenState === 'lobby' && activeContext && (
              <InterviewLobby
                context={activeContext}
                onStartInterview={handleStartLiveInterview}
                onBackToSetup={() => {
                  setScreenState('home');
                  setIsSetupOpen(true);
                }}
              />
            )}

            {screenState === 'live_interview' && activeContext && (
              <LiveInterviewScreen
                context={activeContext}
                onFinishInterview={handleFinishLiveInterview}
                onAbort={handleBackToHome}
              />
            )}

            {screenState === 'feedback' && activeSession && (
              <FeedbackReport
                session={activeSession}
                onRehearseAgain={handleRehearseAgain}
                onBackToHome={handleBackToHome}
                onViewHistory={() => {
                  setAllSessions(sessionStore.getAllSessions());
                  setCurrentTab('history');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Setup Modal */}
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onProceedToLobby={handleProceedToLobby}
        initialFocusArea={setupFocusArea}
        initialContext={setupInitialContext}
      />
    </div>
  );
}
