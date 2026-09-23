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

export const SAMPLE_DEMO_RESUME_TEXT = `Alex Chen
San Francisco, CA • alex.chen@example.com • (555) 234-5678 • github.com/alexchen • linkedin.com/in/alexchen

EDUCATION
State University — B.S. in Computer Science (GPA: 3.8 / 4.0)
Graduated May 2025 • Relevant Coursework: Data Structures, Web Applications, Database Systems, Software Design

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks & Tools: React, Next.js, Node.js, Express, PostgreSQL, Git, Tailwind CSS, Jest, Docker

FEATURED PROJECTS
TaskFlow — Team Task Management Web App (React, Node.js, PostgreSQL)
• Built a responsive full-stack task manager with real-time updates and user authentication.
• Designed clean PostgreSQL database schema for users, project boards, and task assignments.
• Implemented drag-and-drop task organization and automated email notifications for upcoming deadlines.

Campus Marketplace — Student Exchange Platform (TypeScript, React, Express)
• Developed an online student marketplace for buying and selling textbooks and course materials.
• Created intuitive search filters by course, department, and condition, serving 500+ active campus users.
• Integrated secure JWT session management and responsive mobile-first UI with Tailwind CSS.

WORK EXPERIENCE
TechCorp Solutions — Software Engineering Intern (June 2024 – August 2024)
• Developed and tested customer-facing dashboard features in React and TypeScript.
• Collaborated in weekly agile standups and sprint planning to deliver features on schedule.
• Wrote unit and integration tests using Jest, maintaining 85% test coverage across core components.`;

export const INITIAL_SAMPLE_SESSION: InterviewSession = {
  id: 'session_sample_01',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  context: {
    role: 'Software Engineer',
    company: 'TechCorp',
    interviewType: 'behavioural',
    durationMinutes: 10,
    resumeText: SAMPLE_DEMO_RESUME_TEXT,
    focusArea: 'Collaboration and conflict resolution',
  },
  status: 'completed',
  currentQuestionIndex: 2,
  questions: [
    {
      id: 'q_sample_1',
      text: "Tell me about a technical project you've worked on and one challenging decision you had to make.",
      topic: 'Projects & Architecture',
      type: 'technical',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'q_sample_2',
      text: 'Why did you choose PostgreSQL for that project instead of a document store like MongoDB?',
      topic: 'Database Selection & Trade-offs',
      type: 'follow_up',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 120000).toISOString(),
    },
    {
      id: 'q_sample_3',
      text: 'How would your database design change if the number of users and orders increased significantly?',
      topic: 'Database Scalability & Indexing',
      type: 'follow_up',
      difficulty: 'hard',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 240000).toISOString(),
    },
  ],
  answers: [
    {
      id: 'ans_sample_1',
      questionId: 'q_sample_1',
      transcript: 'I built a food delivery application using React, Node, and PostgreSQL. One challenging decision was choosing our primary database schema.',
      durationSeconds: 32,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Good',
        technicalAccuracy: 'Good',
        extractedKeyPoints: ['Food delivery app', 'React, Node, PostgreSQL'],
        requiresFollowUp: true,
      },
    },
    {
      id: 'ans_sample_2',
      questionId: 'q_sample_2',
      transcript: 'We needed relational data for users, restaurants, menu items, and orders with strict ACID transaction guarantees so orders were never lost.',
      durationSeconds: 40,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Good',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['ACID transactions', 'Relational integrity'],
        requiresFollowUp: true,
      },
    },
    {
      id: 'ans_sample_3',
      questionId: 'q_sample_3',
      transcript: 'I would introduce read replicas, partition historical order tables by month, and add an in-memory Redis cache for active menus.',
      durationSeconds: 45,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 300000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Read replicas', 'Table partitioning', 'Redis cache'],
        requiresFollowUp: false,
      },
    },
  ],
  feedback: {
    technicalScore: 'Good',
    communicationScore: 'Good',
    interviewHandlingScore: 'Good',
    summaryVerdict: 'Strong technical knowledge demonstrated on database fundamentals. Technical reasoning and trade-off comparison is your next focus.',
    whatWentWell: [
      'Explained project architecture and tech stack choices directly.',
      'Identified the need for ACID transaction semantics in ordering.',
      'Proposed valid scaling techniques: read replicas, table partitioning, and Redis caching.',
    ],
    whatToImprove: [
      'Contrast why alternatives like MongoDB or DynamoDB were eliminated instead of just listing PostgreSQL benefits.',
      'Provide concrete metrics or estimations when explaining 100x scaling (e.g. read vs write QPS).',
      'Briefly structure your scaling answer by storage, cache layer, and query optimization.',
    ],
    nextRehearsalFocus: 'Technical reasoning and architectural trade-offs.',
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 360000).toISOString(),
  },
  totalDurationSeconds: 480,
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
      return JSON.parse(data);
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
