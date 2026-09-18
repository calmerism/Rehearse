import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '@/app/page';

describe('Rehearse Again and Interview Types Flow', () => {
  beforeEach(() => {
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

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/speech/token') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ mock: true }),
        } as Response);
      }
      if (url === '/api/interviews') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            session: {
              id: 's_test',
              createdAt: new Date().toISOString(),
              context: { role: 'iOS Developer', interviewType: 'behavioural', durationMinutes: 10 },
              status: 'in_progress',
              currentQuestionIndex: 0,
              questions: [{ id: 'q_1', text: 'Test question', topic: 'Test', type: 'behavioural', difficulty: 'medium', timestamp: new Date().toISOString() }],
              answers: [],
              totalDurationSeconds: 0,
              isDemoMode: true,
            },
            introText: 'Intro text',
            firstQuestion: { id: 'q_1', text: 'Test question', topic: 'Test', type: 'behavioural', difficulty: 'medium', timestamp: new Date().toISOString() },
            isDemoMode: true,
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  it('allows selecting behavioural, going to lobby, and clicking start interview', async () => {
    render(<Page />);

    // Click Start Rehearsal
    const startBtn = screen.getByRole('button', { name: /Start Rehearsal/i });
    fireEvent.click(startBtn);

    // Modal is open. Select behavioural
    const behaviouralBtn = screen.getByRole('button', { name: /behavioural/i });
    fireEvent.click(behaviouralBtn);

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue to Lobby/i });
    fireEvent.click(continueBtn);

    // Wait for Lobby to appear
    await waitFor(() => {
      expect(screen.getByText('Your rehearsal is ready.')).toBeDefined();
      expect(screen.getAllByText(/behavioural/i).length).toBeGreaterThan(0);
    });

    // Click Start Interview
    const startInterviewBtn = screen.getByRole('button', { name: /Start Interview/i });
    fireEvent.click(startInterviewBtn);

    // Live interview screen should mount
    await waitFor(() => {
      expect(screen.getByText('Q1 of ~6')).toBeDefined();
    });
  });

  it('preserves full candidate context (role, format, resume, focus) when Rehearse Again is clicked from History', async () => {
    // Seed a custom iOS developer session in storage
    const customSession = {
      id: 'session_ios_01',
      createdAt: new Date().toISOString(),
      context: {
        role: 'iOS Developer',
        company: 'Apple',
        interviewType: 'behavioural',
        durationMinutes: 10,
        resumeText: 'Built Swift music client with AVPlayer and Combine.',
        focusArea: 'Structure answers with STAR method.',
      },
      status: 'completed',
      currentQuestionIndex: 0,
      questions: [
        {
          id: 'q_1',
          text: 'Tell me about a time you had to collaborate closely with a team.',
          topic: 'Collaboration',
          type: 'behavioural',
          difficulty: 'medium',
          timestamp: new Date().toISOString(),
        },
      ],
      answers: [
        {
          id: 'ans_1',
          questionId: 'q_1',
          transcript: 'I collaborated on cache eviction algorithms.',
          durationSeconds: 30,
          timestamp: new Date().toISOString(),
        },
      ],
      feedback: {
        technicalScore: 'Good',
        communicationScore: 'Good',
        interviewHandlingScore: 'Good',
        summaryVerdict: 'Strong technical knowledge on Swift.',
        whatWentWell: ['Direct communication.'],
        whatToImprove: ['Use STAR method.'],
        nextRehearsalFocus: 'Structure answers with the STAR method and provide concrete behavioral examples.',
        completedAt: new Date().toISOString(),
      },
      totalDurationSeconds: 120,
      isDemoMode: true,
    };

    window.localStorage.setItem('rehearse_sessions_v1', JSON.stringify([customSession]));

    render(<Page />);

    // Navigate to History tab
    const historyTabBtn = screen.getByRole('button', { name: /^history$/i });
    fireEvent.click(historyTabBtn);

    // Should see the iOS Developer card
    await waitFor(() => {
      expect(screen.getByText('iOS Developer')).toBeDefined();
    });

    // Click on the session to open detail modal
    fireEvent.click(screen.getByText('iOS Developer'));

    // Detail modal opens - click Rehearse Again
    await waitFor(() => {
      expect(screen.getByText('Summary Verdict')).toBeDefined();
    });
    const rehearseAgainBtn = screen.getByRole('button', { name: /Rehearse Again/i });
    fireEvent.click(rehearseAgainBtn);

    // Setup modal should now be open with PRESERVED context!
    await waitFor(() => {
      expect(screen.getByText('Interview Setup')).toBeDefined();
      expect(screen.getByDisplayValue('iOS Developer')).toBeDefined();
      expect(screen.getByDisplayValue('Apple')).toBeDefined();
      expect(screen.getByText('Grounded')).toBeDefined();
      expect(screen.getByText(/Targeting weakness:/i)).toBeDefined();
    });

    // Click Continue to Lobby
    const continueBtn = screen.getByRole('button', { name: /Continue to Lobby/i });
    fireEvent.click(continueBtn);

    // Lobby should display iOS Developer and Apple
    await waitFor(() => {
      expect(screen.getByText('Your rehearsal is ready.')).toBeDefined();
      expect(screen.getAllByText('iOS Developer').length).toBeGreaterThan(0);
      expect(screen.getByText('Apple')).toBeDefined();
    });

    // Click Start Interview in Lobby
    const startInterviewBtn = screen.getByRole('button', { name: /Start Interview/i });
    fireEvent.click(startInterviewBtn);

    // Live rehearsal should mount
    await waitFor(() => {
      expect(screen.getByText('Q1 of ~6')).toBeDefined();
    });
  });
});
