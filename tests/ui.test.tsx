import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomeScreen } from '@/components/home/HomeScreen';
import { Header } from '@/components/layout/Header';
import { InterviewSetupModal } from '@/components/setup/InterviewSetupModal';
import { RehearsalDetailModal } from '@/components/history/RehearsalDetailModal';
import Page from '@/app/page';

describe('UI Button Click Handlers', () => {
  beforeEach(() => {
    // Mock localStorage
    const storage: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => storage[key] || null),
        setItem: vi.fn((key: string, val: string) => { storage[key] = val; }),
        removeItem: vi.fn((key: string) => { delete storage[key]; }),
        clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
      },
      writable: true,
    });
    // Mock fetch for /api/speech/token
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ mock: true }),
    } as Response);
  });

  it('HomeScreen Start Rehearsal button calls onStartRehearsal', () => {
    const onStart = vi.fn();
    const onHistory = vi.fn();
    render(<HomeScreen onStartRehearsal={onStart} onViewHistory={onHistory} latestSession={null} />);

    const startBtn = screen.getByRole('button', { name: /Start Rehearsal/i });
    expect(startBtn).toBeDefined();
    fireEvent.click(startBtn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('HomeScreen View History button calls onViewHistory', () => {
    const onStart = vi.fn();
    const onHistory = vi.fn();
    render(<HomeScreen onStartRehearsal={onStart} onViewHistory={onHistory} latestSession={null} />);

    const historyBtn = screen.getByRole('button', { name: /View History/i });
    expect(historyBtn).toBeDefined();
    fireEvent.click(historyBtn);
    expect(onHistory).toHaveBeenCalledTimes(1);
  });

  it('Header navigation buttons trigger onSelectTab', () => {
    const onSelectTab = vi.fn();
    const onToggleTheme = vi.fn();
    render(
      <Header
        currentTab="home"
        onSelectTab={onSelectTab}
        isDemoMode={true}
        theme="dark"
        onToggleTheme={onToggleTheme}
      />
    );

    const historyTab = screen.getByRole('button', { name: /history/i });
    fireEvent.click(historyTab);
    expect(onSelectTab).toHaveBeenCalledWith('history');

    const settingsTab = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsTab);
    expect(onSelectTab).toHaveBeenCalledWith('settings');

    const themeToggle = screen.getByRole('button', { name: /Toggle Theme/i });
    fireEvent.click(themeToggle);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('Full Page: clicking Start Rehearsal opens the Setup Modal and Cancel closes it', async () => {
    render(<Page />);

    // Initially setup modal is not visible
    expect(screen.queryByText('Interview Setup')).toBeNull();

    // Click Start Rehearsal
    const startBtn = screen.getByRole('button', { name: /Start Rehearsal/i });
    fireEvent.click(startBtn);

    // Modal is now open
    expect(screen.getByText('Interview Setup')).toBeDefined();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    // Modal closes after animation
    await waitFor(() => {
      expect(screen.queryByText('Interview Setup')).toBeNull();
    });
  });

  it('InterviewSetupModal renders proper headings and handles submission', () => {
    const onProceed = vi.fn();
    const onClose = vi.fn();
    render(
      <InterviewSetupModal
        isOpen={true}
        onClose={onClose}
        onProceedToLobby={onProceed}
      />
    );

    // Assert proper headings exist
    expect(screen.getByRole('heading', { name: 'Position', level: 3 })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Interview Format', level: 3 })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Duration', level: 3 })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Resume Context', level: 3 })).toBeDefined();

    // Click continue
    const continueBtn = screen.getByRole('button', { name: /Continue to Lobby/i });
    fireEvent.click(continueBtn);
    expect(onProceed).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'Software Engineer Intern',
        interviewType: 'technical',
        durationMinutes: 10,
      })
    );
  });

  it('RehearsalDetailModal renders proper headings and allows question expand', () => {
    const mockSession = {
      id: 'session_1',
      createdAt: '2026-09-16T12:00:00.000Z',
      context: {
        role: 'Full Stack Engineer',
        interviewType: 'technical' as const,
        durationMinutes: 10 as const,
      },
      status: 'completed' as const,
      currentQuestionIndex: 1,
      questions: [{ id: 'q1', text: 'Describe a complex project', topic: 'Architecture', type: 'technical' as const, timestamp: '2026-09-17T10:00:00Z' }],
      answers: [{ id: 'ans1', questionId: 'q1', transcript: 'I designed a distributed cache', durationSeconds: 20, timestamp: '2026-09-17T10:00:20Z' }],
      totalDurationSeconds: 120,
      isDemoMode: false,
      feedback: {
        completedAt: '2026-09-17T10:02:00Z',
        summaryVerdict: 'Strong technical grasp.',
        technicalScore: 'Strong' as const,
        communicationScore: 'Good' as const,
        interviewHandlingScore: 'Strong' as const,
        whatWentWell: ['Great explanation'],
        whatToImprove: ['Add concrete metrics'],
        nextRehearsalFocus: 'System trade-offs',
      },
    };

    render(
      <RehearsalDetailModal
        session={mockSession}
        onClose={vi.fn()}
        onRehearseAgain={vi.fn()}
      />
    );

    // Verify proper headings
    expect(screen.getByRole('heading', { name: 'Full Stack Engineer', level: 2 })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Summary Verdict', level: 3 })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Questions & Answers', level: 3 })).toBeDefined();

    // Verify question is visible
    expect(screen.getByText('Describe a complex project')).toBeDefined();
  });
});
