import { InterviewSession, UserPreferences } from '@/types/interview';

const SESSIONS_STORAGE_KEY = 'rehearse_sessions_v1';
const PREFERENCES_STORAGE_KEY = 'rehearse_preferences_v4';

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Candidate',
  voiceName: 'Auto (Best Natural)',
  speechRate: 1.02,
  theme: 'light',
  reducedMotion: false,
  enableCamera: false,
  forceDemoMode: false,
};

export const SAMPLE_DEMO_RESUME_TEXT = `Rehearse — Behavioral Interview Demonstration: Questions & Sample Answers
Candidate: Alex Chen  |  Position: Software Engineer  |  Framework: STAR Method (5 Competencies)

QUESTION 1: Teamwork & Tight Deadlines
Prompt: "Tell me about a time you had to work with a multidisciplinary team or peer engineer under a tight deadline. How did you ensure alignment and deliver?"
• Situation: During my software engineering internship at TechCorp Solutions, our team had a strict two-week sprint to ship an analytics reporting dashboard ahead of an executive client demo.
• Task: I was responsible for collaborating with a frontend engineer and a product manager to design and deliver the customer-facing dashboard components and backend REST endpoints on time.
• Action: I set up a daily 10-minute morning standup to surface blockers immediately, established OpenAPI and TypeScript interface contracts on day one, and built mock API fixtures so frontend development could proceed in parallel without waiting on database migrations.
• Result: We shipped the feature two days ahead of the delivery date with zero integration defects during QA, resulting in a successful client presentation and renewal.

QUESTION 2: Conflict & Disagreement Resolution
Prompt: "Describe a situation where you had a strong disagreement with a teammate regarding a technical or product choice. How did you handle it and what was the outcome?"
• Situation: While building TaskFlow, our full-stack collaborative task management application, a peer engineer advocated for using MongoDB for rapid schema flexibility, whereas I recommended PostgreSQL.
• Task: We needed to reach a consensus without delaying our sprint kickoff or creating technical debt.
• Action: Rather than debating preferences, I proposed an objective benchmark matrix. We analyzed our core entity relationships—project boards, tasks, user permissions, and audit logs. I demonstrated that relational integrity with foreign keys and ACID transaction guarantees was essential to avoid orphaned subtasks during concurrent drag-and-drop operations.
• Result: My teammate reviewed the prototype and agreed PostgreSQL was the sounder architectural choice. We completed the project on schedule, maintaining 100% data consistency across thousands of simulated task updates.

QUESTION 3: Navigating Setbacks & Incident Recovery
Prompt: "Can you share an experience where a project or deployment didn't go as planned or failed? What immediate actions did you take, and what did you learn?"
• Situation: During a staging deployment for the Campus Marketplace platform, an automated database migration script failed due to an unindexed unique constraint conflict on legacy user records, locking the staging database.
• Task: As the engineer running the deployment, I had to restore staging availability immediately and resolve the root cause of the schema failure.
• Action: I immediately notified the team on Slack, executed our automated rollback script to restore staging traffic within three minutes, and analyzed the migration logs. I isolated the conflicting records, wrote a safe, idempotent data-cleaning migration step, added comprehensive unit tests, and verified the fix against a sanitized production clone.
• Result: The revised migration deployed cleanly in under ten seconds. I also added pre-deployment dry-run validation scripts to our CI/CD pipeline, permanently preventing similar constraint failures.

QUESTION 4: Initiative & Organizational Ownership
Prompt: "Tell me about a time you went beyond your assigned responsibilities to solve a problem or improve a process for your team."
• Situation: When I joined TechCorp Solutions as an intern, new contributor onboarding was a painful multi-step manual process. Conflicting Node and Docker versions frequently cost new engineers half a day to troubleshoot.
• Task: Although my assigned sprint tickets were strictly user-facing dashboard features, I recognized that fixing onboarding friction would permanently save engineering hours across the entire team.
• Action: Over the weekend, I containerized the entire local development stack using Docker Compose, authored a one-command bootstrap script (./scripts/dev-setup.sh), and restructured the outdated setup documentation with step-by-step verification checks.
• Result: I submitted a pull request with full documentation. The engineering lead approved it, and it reduced developer onboarding time from four hours to under fifteen minutes across all incoming contributors.

QUESTION 5: Prioritization & Competing Urgencies
Prompt: "How do you handle situations where you are faced with competing priorities or urgent requests from stakeholders while already committed to a delivery date?"
• Situation: During release week at TechCorp, while midway through implementing critical security authentication patches, customer success submitted an urgent request for a custom CSV export feature for a high-priority enterprise prospect.
• Task: I had to handle the customer request without compromising our scheduled security fixes or missing our deployment window.
• Action: I applied an urgency-versus-impact triage: security was non-negotiable. I immediately met with the product manager and customer success lead, transparently laid out our capacity, and proposed an agile compromise: I built a lightweight CSV export endpoint within two hours to satisfy the client demo, while scoping the full automated reporting engine for the subsequent sprint.
• Result: The client signed the contract, our security authentication fixes shipped on schedule with zero regressions, and both stakeholders appreciated the transparent communication.`;

export const INITIAL_SAMPLE_SESSION: InterviewSession = {
  id: 'session_sample_01',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  context: {
    role: 'Software Engineer',
    company: 'TechCorp Solutions',
    interviewType: 'behavioural',
    durationMinutes: 10,
    targetQuestions: 5,
    isSampleDemo: true,
    resumeText: SAMPLE_DEMO_RESUME_TEXT,
    focusArea: 'Collaboration, incident recovery, and STAR responses',
  },
  status: 'completed',
  currentQuestionIndex: 4,
  questions: [
    {
      id: 'q_sample_1',
      text: 'Tell me about a time you had to work with a multidisciplinary team or peer engineer under a tight deadline. How did you ensure alignment and deliver?',
      topic: 'Teamwork & Tight Deadlines',
      type: 'behavioural',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'q_sample_2',
      text: 'Describe a situation where you had a strong disagreement with a teammate regarding a technical or product choice. How did you handle it and what was the outcome?',
      topic: 'Conflict & Disagreement Resolution',
      type: 'behavioural',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 90000).toISOString(),
    },
    {
      id: 'q_sample_3',
      text: "Can you share an experience where a project or deployment didn't go as planned or failed? What immediate actions did you take, and what did you learn?",
      topic: 'Resilience & Setbacks',
      type: 'behavioural',
      difficulty: 'hard',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180000).toISOString(),
    },
    {
      id: 'q_sample_4',
      text: 'Tell me about a time you went beyond your assigned responsibilities to solve a problem or improve a process for your team.',
      topic: 'Initiative & Ownership',
      type: 'behavioural',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 270000).toISOString(),
    },
    {
      id: 'q_sample_5',
      text: 'How do you handle situations where you are faced with competing priorities or urgent requests from stakeholders while already committed to a delivery date?',
      topic: 'Prioritization & Competing Urgencies',
      type: 'behavioural',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 360000).toISOString(),
    },
  ],
  answers: [
    {
      id: 'ans_sample_1',
      questionId: 'q_sample_1',
      transcript: 'During my internship at TechCorp, our team had a two-week sprint to ship an analytics dashboard ahead of a client demo. I established daily 10-minute standups, agreed on strict OpenAPI contracts on day one, and built mock API response fixtures so the frontend developer could build UI components in parallel without waiting on backend endpoints. We shipped two days early with zero defects.',
      durationSeconds: 38,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Two-week sprint', 'Daily standups', 'OpenAPI contracts', 'Mock fixtures'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_2',
      questionId: 'q_sample_2',
      transcript: 'On TaskFlow, a teammate wanted to use MongoDB for rapid prototyping while I advocated for PostgreSQL. Rather than debating opinions, I built an objective benchmark matrix showing that our relational entity relationships—boards, tasks, and audit logs—required foreign keys and ACID constraints to prevent orphaned tasks during drag-and-drop actions. My peer agreed with the data and we completed on time.',
      durationSeconds: 42,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 150000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Benchmark matrix', 'Relational integrity', 'ACID constraints', 'Objective consensus'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_3',
      questionId: 'q_sample_3',
      transcript: 'During our Campus Marketplace deployment, an automated migration failed on an unindexed unique constraint, locking staging. I communicated the incident on Slack, triggered an automated rollback to restore availability in three minutes, and isolated the offending records. I wrote an idempotent migration with comprehensive unit tests and verified it on a clone. I then added dry-run validation to our CI pipeline.',
      durationSeconds: 45,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 240000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Rollback in 3 min', 'Idempotent migration', 'CI dry-run validation', 'Root cause post-mortem'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_4',
      questionId: 'q_sample_4',
      transcript: 'At TechCorp, new engineer onboarding was a multi-step manual process costing new teammates two days of environment debugging. Although my assigned tickets were feature-focused, I containerized the entire local stack using Docker Compose, authored a one-click setup script, and overhauled the documentation. This reduced onboarding time from two days to under fifteen minutes across the team.',
      durationSeconds: 40,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 330000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Docker Compose containerization', 'Automated bootstrap script', 'Onboarding cut to 15 min'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_5',
      questionId: 'q_sample_5',
      transcript: 'During release week, an urgent request for a custom CSV export came from customer success for an enterprise deal while I was completing authentication security fixes. I applied urgency-vs-impact triage: security was non-negotiable. I met with stakeholders, transparently presented capacity, and built a minimal CSV script within two hours for the demo while scheduling full automation for the next sprint.',
      durationSeconds: 42,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 420000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Urgency vs impact triage', 'Non-negotiable security', 'Minimal viable delivery in 2 hours', 'Transparent stakeholder sync'],
        requiresFollowUp: false,
      },
    },
  ],
  feedback: {
    technicalScore: 'Strong',
    communicationScore: 'Strong',
    interviewHandlingScore: 'Strong',
    summaryVerdict: 'Exceptional demonstration of STAR structure across all 5 behavioral competencies. Demonstrates proactive leadership, clear technical trade-off evaluation, and rapid composure during staging incidents.',
    whatWentWell: [
      'Structured every response cleanly using Situation, Task, Action, and measurable Result.',
      'Defended technical decisions objectively using benchmarks and data integrity constraints.',
      'Handled staging incident recovery with blameless post-mortem actions and CI prevention.',
      'Managed competing stakeholder requests with transparent communication and agile triage.',
    ],
    whatToImprove: [
      'In future rehearsals, highlight mentoring and delegation when discussing larger engineering initiatives.',
      'Quantify business impacts with customer NPS or system performance percentiles where applicable.',
    ],
    nextRehearsalFocus: 'System design scaling and executive architectural defense.',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 450000).toISOString(),
  },
  totalDurationSeconds: 450,
  isDemoMode: true,
};

class SessionStore {
  private inMemorySessions: InterviewSession[] = [INITIAL_SAMPLE_SESSION];
  private inMemoryPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };

  public getAllSessions(): InterviewSession[] {
    if (typeof window === 'undefined') return this.inMemorySessions;

    try {
      const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!data) {
        // Seed initial sample session
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([INITIAL_SAMPLE_SESSION]));
        return [INITIAL_SAMPLE_SESSION];
      }
      const parsed: InterviewSession[] = JSON.parse(data);
      const updated = parsed.map((s) => (s.id === 'session_sample_01' ? INITIAL_SAMPLE_SESSION : s));
      return updated;
    } catch (err) {
      console.warn('[SessionStore] localStorage error:', err);
      return this.inMemorySessions;
    }
  }

  public getSessionById(id: string): InterviewSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  public saveSession(session: InterviewSession): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }

    this.inMemorySessions = sessions;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        console.warn('[SessionStore] Failed to save session:', err);
      }
    }
  }

  public getLatestSession(): InterviewSession | null {
    const sessions = this.getAllSessions();
    return sessions.length > 0 ? sessions[0] : null;
  }

  public getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return this.inMemoryPreferences;
    try {
      const data = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!data) return { ...DEFAULT_PREFERENCES };
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
    } catch {
      return this.inMemoryPreferences;
    }
  }

  public savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    this.inMemoryPreferences = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('[SessionStore] Failed to save preferences:', err);
      }
    }
    return updated;
  }
}

export const sessionStore = new SessionStore();
