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

export const SAMPLE_DEMO_RESUME_TEXT = `Candidate Resume & 5-Question Interview Rehearsal Guide
Candidate: Kashish | Chitkara University (B.E. Artificial Intelligence, CGPA 9.58)
Target Role: AI & Software Engineer

EDUCATION & ACADEMICS:
• Chitkara University, Rajpura, Punjab: Bachelor of Engineering (B.E.) in Artificial Intelligence (2024–2028) | CGPA: 9.58 / 10.00
• Doon International School: Class XII (89.6%), Class X (91.8%)

TECHNICAL SKILLS:
• Programming Languages: Python, C++, Java, MySQL, SQLite, HTML, CSS, JavaScript
• Frameworks & Libraries: Django, Pandas, NumPy, Scikit-learn
• Developer Tools & Platforms: Git, GitHub, VS Code, Figma
• Achievements: 2nd place in Intellex (Chitkara University), 3rd place in Byte Tourney 2.0 (Figma), LadyADA 2 rounds qualified, SIH (Smart India Hackathon) & SAP Ideathon participant

PROJECTS:
1. Telecom Customer Churn Prediction (AI/ML):
   Developed a machine learning model to predict customer churn in the telecom sector using Python, Pandas, NumPy, and Scikit-learn. Performed exploratory data analysis (EDA), data cleaning, and feature engineering to identify primary churn risk drivers and contract patterns. Built and evaluated classification algorithms (Logistic Regression, Random Forest Classifier) prioritizing Recall and ROC-AUC metrics for imbalanced churn data. Visualized churn drivers and customer segment retention behaviors with Matplotlib.

2. TOGETHERLY – Collaborative LinkedIn Clone (Full-Stack Backend):
   Built a full-stack professional networking web platform utilizing Django and SQLite. Implemented secure user authentication, user profile management, and complete CRUD operations for posts, comments, and media. Designed a real-time messaging and peer connection request system enabling seamless direct communication between users.

3. INNOFIND – Tech Resource Discovery Platform (Frontend & Persistence):
   Engineered a responsive web application to help developers and students explore curated technical tools, documentation, and frameworks. Implemented using semantic HTML, CSS, and modern JavaScript with local storage (window.localStorage) persistence for personalized study task lists and calendar planning. Built dynamic light/dark theme toggles and responsive layouts.

CURATED 5-QUESTION REHEARSAL & STAR MODEL ANSWERS:

QUESTION 1: Telecom Customer Churn Prediction (AI/ML)
Prompt: "Welcome Kashish. Could you introduce yourself and tell us about your Telecom Customer Churn Prediction project—specifically, what classification models you tested and which metrics you used to evaluate them?"
• Situation: In telecommunications, acquiring a new customer costs 5x more than retaining an existing one. I built a predictive churn model to identify at-risk subscribers before they cancel.
• Task: I evaluated multiple classification models on customer usage, billing, and contract data, selecting the best model and performance metrics.
• Action: I implemented Logistic Regression as a baseline and trained a Random Forest Classifier in Scikit-learn. Because customer churn has an imbalanced class distribution, standard accuracy is misleading. I focused on Recall and ROC-AUC to minimize false negatives (failing to detect churners).
• Result: The Random Forest model achieved 84% recall on churned subscribers with an ROC-AUC of 0.88, pinpointing month-to-month contracts and lack of tech support as primary churn drivers.

QUESTION 2: Data Preprocessing & Feature Engineering (Pandas & NumPy)
Prompt: "In your telecom churn analysis, how did you handle data preprocessing and feature engineering with Pandas and NumPy, especially for missing values and categorical data?"
• Situation: Raw customer telemetry contained missing total charges, inconsistent data types, and non-numeric categorical columns (payment method, contract type).
• Task: I needed to engineer a clean, leak-free preprocessing pipeline to feed into Scikit-learn classifiers.
• Action: Using Pandas, I detected blank strings in total charges, converted them to float, and imputed missing values using median tenure grouping. I applied One-Hot Encoding via pd.get_dummies and Scikit-learn's OneHotEncoder for nominal categories. With NumPy and StandardScaler, I normalized continuous attributes (tenure, monthly charges) to ensure equal feature weighting.
• Result: The resulting preprocessed matrix maintained zero data leakage, preserved feature variance, and reduced training convergence time.

QUESTION 3: Togetherly – Django Backend & Database (Django & SQLite)
Prompt: "You built TOGETHERLY, a LinkedIn clone using Django and SQLite. How did you structure your models and implement user authentication, CRUD operations, and real-time messaging?"
• Situation: Professional networking platforms require complex entity relationships—profiles, connection graphs, posts, comments, and private messages.
• Task: Architect a modular Django backend with secure authentication and real-time peer messaging.
• Action: I designed relational models using Django's ORM: UserProfile with OneToOneField to auth.User, Post and Comment with foreign keys, and a Message model linking sender and recipient with timestamp ordering. I leveraged Django's built-in authentication and CSRF protection for session security, wrote class-based views for CRUD post operations, and implemented an asynchronous message inbox using AJAX endpoints.
• Result: Built a responsive, secure networking platform supporting seamless post publishing, profile editing, and sub-second direct messaging.

QUESTION 4: INNOFIND – Frontend & Local Storage (HTML/CSS/JS)
Prompt: "For INNOFIND, you created a tech resource discovery platform using HTML, CSS, and JavaScript. How did you implement local storage for data persistence across features like the to-do list and calendar?"
• Situation: Users wanted a personalized workspace to bookmark development resources, track study tasks, and schedule learning goals without creating server-side accounts.
• Task: Implement resilient client-side state persistence for to-do items, calendar events, and theme preferences.
• Action: I built a centralized StorageManager utility wrapping window.localStorage with JSON serialization and deserialization. Every state change (adding a task, checking off a study item, updating calendar dates) calls saveState() with try-catch validation. On initial page load, the application hydrates the DOM from localStorage, falling back gracefully to empty states if storage is cleared.
• Result: Users retain their study roadmaps and theme preferences across page reloads and browser sessions with zero network latency.

QUESTION 5: Hackathons, Teamwork & Problem Solving (Intellex & SIH)
Prompt: "You have participated in hackathons like the Smart India Hackathon and won second place in Intellex at Chitkara University. Tell me about a time in a team project or hackathon where you faced a tough technical roadblock and how you collaborated to solve it."
• Situation: During the Intellex hackathon at Chitkara University, where our team won second place, our application suffered critical CORS errors and asynchronous race conditions four hours before final judging.
• Task: We needed to debug the API connection and state synchronization without panicking or missing our demo presentation deadline.
• Action: I initiated a quick 5-minute team standup, divided tasks cleanly: I took ownership of debugging the network payloads in browser DevTools, configuring backend CORS middleware, and wrapping asynchronous fetch calls with try/catch and loading state guards. Meanwhile, my teammate polished the pitch deck and user flow slides.
• Result: We resolved the race condition in two hours, tested end-to-end flows, and delivered an error-free live demonstration, winning 2nd place among competing teams.`;

export const INITIAL_SAMPLE_SESSION: InterviewSession = {
  id: 'session_sample_01',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  context: {
    role: 'AI & Software Engineer',
    company: 'Chitkara University',
    interviewType: 'behavioural',
    durationMinutes: 10,
    targetQuestions: 5,
    isSampleDemo: true,
    resumeText: SAMPLE_DEMO_RESUME_TEXT,
    focusArea: 'Telecom Churn ML, Django Backend, Frontend Persistence & Hackathons',
  },
  status: 'completed',
  currentQuestionIndex: 4,
  questions: [
    {
      id: 'q_sample_1',
      text: 'Welcome Kashish. Could you introduce yourself and tell us about your Telecom Customer Churn Prediction project—specifically, what classification models you tested and which metrics you used to evaluate them?',
      topic: 'Telecom Churn Prediction (AI/ML)',
      type: 'technical',
      difficulty: 'easy',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'q_sample_2',
      text: 'In your telecom churn analysis, how did you handle data preprocessing and feature engineering with Pandas and NumPy, especially for missing values and categorical data?',
      topic: 'Data Preprocessing & Feature Engineering',
      type: 'technical',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 90000).toISOString(),
    },
    {
      id: 'q_sample_3',
      text: 'You built TOGETHERLY, a LinkedIn clone using Django and SQLite. How did you structure your models and implement user authentication, CRUD operations, and real-time messaging?',
      topic: 'Togetherly – Django Backend & Database',
      type: 'technical',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 180000).toISOString(),
    },
    {
      id: 'q_sample_4',
      text: 'For INNOFIND, you created a tech resource discovery platform using HTML, CSS, and JavaScript. How did you implement local storage for data persistence across features like the to-do list and calendar?',
      topic: 'INNOFIND – Frontend & Local Storage',
      type: 'technical',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 270000).toISOString(),
    },
    {
      id: 'q_sample_5',
      text: 'You have participated in hackathons like the Smart India Hackathon and won second place in Intellex at Chitkara University. Tell me about a time in a team project or hackathon where you faced a tough technical roadblock and how you collaborated to solve it.',
      topic: 'Hackathons, Teamwork & Problem Solving',
      type: 'behavioural',
      difficulty: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 360000).toISOString(),
    },
  ],
  answers: [
    {
      id: 'ans_sample_1',
      questionId: 'q_sample_1',
      transcript: "Hi, I'm Kashish, a B.E. Artificial Intelligence student at Chitkara University. In my Telecom Customer Churn Prediction project, my objective was to forecast which customers were at risk of leaving so the retention team could take proactive steps. I tested Logistic Regression as a baseline and then trained a Random Forest Classifier with Scikit-learn. Because customer churn involves imbalanced classes, standard accuracy would be misleading, so I prioritized Recall and the ROC-AUC score. Random Forest achieved over 84% recall on churned customers, ensuring we caught high-risk accounts while maintaining high precision.",
      durationSeconds: 42,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['B.E. AI at Chitkara University', 'Logistic Regression & Random Forest', 'Recall & ROC-AUC for imbalanced data', '84% recall on churners'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_2',
      questionId: 'q_sample_2',
      transcript: "For the churn dataset, preprocessing was critical. Using Pandas, I first identified missing values in total charges and imputed them based on tenure and contract type. For categorical features like contract terms, payment methods, and internet service types, I applied One-Hot Encoding via Pandas get_dummies and Scikit-learn's OneHotEncoder. I used NumPy to handle numerical scaling for continuous attributes such as monthly charges and tenure using StandardScaler, preventing high-magnitude features from dominating model training.",
      durationSeconds: 40,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 150000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Missing value imputation', 'One-Hot Encoding with pd.get_dummies', 'NumPy & StandardScaler normalization'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_3',
      questionId: 'q_sample_3',
      transcript: "In TOGETHERLY, I used Django's Model-View-Template architecture with an SQLite database. I designed relational models for UserProfile, Post, ConnectionRequest, and Message with foreign key and ManyToMany relationships. For authentication, I utilized Django's built-in auth framework with custom user profile extensions and session-based security. I built complete CRUD views for posts and comments, and implemented a real-time messaging inbox using Django channels and AJAX endpoints to allow instant messaging between connected peers.",
      durationSeconds: 45,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 240000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Django MVT architecture & SQLite', 'UserProfile, Post, Message models', 'Built-in auth & CRUD views', 'Real-time AJAX messaging inbox'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_4',
      questionId: 'q_sample_4',
      transcript: "For INNOFIND, I created a client-side resource discovery hub using semantic HTML5, modern CSS flexbox and grid, and vanilla JavaScript. To persist user data without requiring a backend server, I built a modular storage manager on top of window.localStorage. Whenever users added tasks to their study to-do list, pinned events on the calendar, or toggled the theme, the state was serialized as JSON into localStorage. On page load, the app parses the stored keys and reconstructs the DOM state immediately, providing seamless persistence across browser sessions.",
      durationSeconds: 38,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 330000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Semantic HTML5, CSS grid/flexbox, JS', 'window.localStorage JSON serialization', 'DOM hydration on reload', 'To-do, calendar, and theme persistence'],
        requiresFollowUp: false,
      },
    },
    {
      id: 'ans_sample_5',
      questionId: 'q_sample_5',
      transcript: "During the Intellex hackathon at Chitkara University, where our team won second place, we faced a critical roadblock four hours before final judging. Our frontend API calls were failing due to unexpected CORS headers and asynchronous state race conditions during live demo testing. Rather than panicking, I called an immediate 5-minute huddle, divided our tasks: I traced the network tab in DevTools and configured proper CORS middleware and async/await error handling, while my teammate finalized the presentation slide deck. We resolved the bug, verified all endpoints, and delivered a smooth live demo that secured 2nd place.",
      durationSeconds: 44,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 420000).toISOString(),
      evaluation: {
        understoodIntent: true,
        clarity: 'Strong',
        technicalAccuracy: 'Strong',
        extractedKeyPoints: ['Intellex hackathon at Chitkara University (2nd place)', 'CORS & async race condition bug', 'DevTools network tracing & middleware fix', 'Team task division & calm delivery'],
        requiresFollowUp: false,
      },
    },
  ],
  feedback: {
    technicalScore: 'Strong',
    communicationScore: 'Strong',
    interviewHandlingScore: 'Strong',
    summaryVerdict: 'Outstanding demonstration across machine learning fundamentals, full-stack backend development with Django, client-side persistence, and hackathon teamwork. Candidate articulated technical trade-offs with clarity and composure.',
    whatWentWell: [
      'Grounded machine learning evaluation in Recall and ROC-AUC for imbalanced churn datasets.',
      'Clearly articulated data preprocessing, missing value imputation, and feature scaling with Pandas and NumPy.',
      'Demonstrated solid architectural understanding of Django ORM, authentication, and relational data structures in Togetherly.',
      'Explained client-side state persistence and JSON serialization with localStorage in INNOFIND.',
      'Exhibited effective hackathon problem-solving, calm triage under deadline pressure, and teamwork during Intellex.',
    ],
    whatToImprove: [
      'Consider discussing hyperparameter tuning (e.g., GridSearchCV) when detailing Random Forest optimization.',
      'Mention caching strategies (e.g., Redis) or database indexing when discussing future scaling for Django messaging.',
    ],
    nextRehearsalFocus: 'Advanced distributed backend architectures and end-to-end ML model deployment pipelines.',
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
