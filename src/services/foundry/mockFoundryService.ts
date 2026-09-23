import {
  CandidateContext,
  Question,
  Answer,
  AnswerEvaluation,
  FeedbackReportData,
  QualitativeScore,
} from '@/types/interview';
import { IFoundryService, NextQuestionDecision } from './types';

export const SAMPLE_BEHAVIORAL_DEMO_QUESTIONS: Omit<Question, 'timestamp'>[] = [
  {
    id: 'q_1',
    text: 'Welcome Kashish. Could you introduce yourself and tell us about your Telecom Customer Churn Prediction project—specifically, what classification models you tested and which metrics you used to evaluate them?',
    topic: 'Telecom Churn Prediction (AI/ML)',
    type: 'technical',
    difficulty: 'easy',
  },
  {
    id: 'q_2',
    text: 'In your telecom churn analysis, how did you handle data preprocessing and feature engineering with Pandas and NumPy, especially for missing values and categorical data?',
    topic: 'Data Preprocessing & Feature Engineering',
    type: 'technical',
    difficulty: 'medium',
  },
  {
    id: 'q_3',
    text: 'You built TOGETHERLY, a LinkedIn clone using Django and SQLite. How did you structure your models and implement user authentication, CRUD operations, and real-time messaging?',
    topic: 'Togetherly – Django Backend & Database',
    type: 'technical',
    difficulty: 'medium',
  },
  {
    id: 'q_4',
    text: 'For INNOFIND, you created a tech resource discovery platform using HTML, CSS, and JavaScript. How did you implement local storage for data persistence across features like the to-do list and calendar?',
    topic: 'INNOFIND – Frontend & Local Storage',
    type: 'technical',
    difficulty: 'medium',
  },
  {
    id: 'q_5',
    text: 'You have participated in hackathons like the Smart India Hackathon and won second place in Intellex at Chitkara University. Tell me about a time in a team project or hackathon where you faced a tough technical roadblock and how you collaborated to solve it.',
    topic: 'Hackathons, Teamwork & Problem Solving',
    type: 'behavioural',
    difficulty: 'medium',
  },
];

export class MockFoundryService implements IFoundryService {
  isRealAzure(): boolean {
    return false;
  }

  async generateIntroductionAndOpening(
    context: CandidateContext
  ): Promise<{ introText: string; firstQuestion: Question }> {
    const role = context.role || 'Software Engineer';
    const type = context.interviewType;
    const hasResume = !!(context.resumeText && context.resumeText.trim().length > 0);
    const roleLower = role.toLowerCase();

    // 5-Question Presentation Demo Preset Grounded in Kashish's Resume
    if (context.isSampleDemo) {
      return {
        introText: `Welcome Kashish to your interview rehearsal. We will cover 5 key technical and project areas from your resume today. Let's begin with our first question.`,
        firstQuestion: {
          ...SAMPLE_BEHAVIORAL_DEMO_QUESTIONS[0],
          timestamp: new Date().toISOString(),
        },
      };
    }

    let introText = `Hi, I will be conducting your ${type} rehearsal today for the ${role} position. I will ask a few questions and follow up based on what you share. Please take your time and answer as you would in a real interview. Let's begin.`;

    let questionText = '';
    let topic = '';
    let qType: Question['type'] = type === 'behavioural' ? 'behavioural' : 'technical';

    if (hasResume) {
      // Grounded in candidate's uploaded resume
      questionText = `Tell me about a technical project you have worked on recently, and one challenging engineering decision you had to make.`;
      topic = 'Projects & Architecture';

      if (type === 'behavioural') {
        questionText = `Tell me about a time you had to collaborate closely with a team or teammate on a challenging project. What was your role and how did you navigate disagreements?`;
        topic = 'Collaboration & Teamwork';
      } else if (type === 'mixed') {
        questionText = `To kick things off, tell me about your background, a significant software project you contributed to, and your specific role in it.`;
        topic = 'Background & Technical Contribution';
      }

      if (context.focusArea) {
        if (context.focusArea.toLowerCase().includes('decision') || context.focusArea.toLowerCase().includes('trade-off')) {
          questionText = `Welcome back to your rehearsal. Keeping your focus on technical trade-offs, tell me about a project where you had to choose between two competing technologies or design patterns, and why you chose your approach.`;
          topic = 'Technical Trade-offs';
        } else if (context.focusArea.toLowerCase().includes('structure')) {
          questionText = `Welcome back. Focusing today on structured responses, walk me through an end-to-end feature you built, structuring your answer by problem, approach, and outcome.`;
          topic = 'Structured Technical Walkthrough';
        }
      }
    } else {
      // When NO resume is uploaded: DO NOT just ask about a project!
      // Evaluate core technical fundamentals, conceptual depth, or practical scenarios tailored to the role
      if (context.focusArea) {
        if (context.focusArea.toLowerCase().includes('decision') || context.focusArea.toLowerCase().includes('trade-off')) {
          questionText = `Welcome back. Focusing today on technical trade-offs, how do you evaluate whether to choose an asynchronous message queue versus synchronous REST or gRPC communication between services, and what operational trade-offs do you weigh?`;
          topic = 'Technical Trade-offs';
        } else if (context.focusArea.toLowerCase().includes('structure')) {
          questionText = `Welcome back. Focusing today on structured technical explanations, how would you walk through the ACID guarantees of a relational database and how they contrast with eventual consistency in distributed systems?`;
          topic = 'ACID Guarantees & Distributed Consistency';
        }
      }

      if (!questionText) {
        if (roleLower.includes('system design') || roleLower.includes('architect')) {
          questionText = `To start our system design rehearsal, how would you approach architecting a resilient, distributed rate-limiting service that protects downstream APIs from traffic spikes while keeping latency under 10 milliseconds?`;
          topic = 'Distributed Rate Limiter Design';
        } else if (type === 'behavioural') {
          questionText = `To kick off our conversation, how do you typically approach navigating technical disagreements when teammates advocate for fundamentally conflicting architecture decisions or libraries?`;
          topic = 'Technical Disagreements & Collaboration';
        } else if (type === 'mixed') {
          questionText = `To kick off our conversation, what core architectural principles do you prioritize when designing maintainable, production-ready software, and how do you evaluate technical debt?`;
          topic = 'Architecture Principles & Technical Debt';
        } else {
          // Technical interview tailored to role
          if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('web') || roleLower.includes('ui')) {
            questionText = `To begin our technical rehearsal, how do you approach state management and rendering optimization in a client application to prevent unnecessary re-renders and maintain smooth 60fps performance?`;
            topic = 'State Architecture & Rendering Performance';
          } else if (roleLower.includes('ios') || roleLower.includes('mobile') || roleLower.includes('android') || roleLower.includes('swift')) {
            questionText = `To begin our technical rehearsal, how do you approach offline data persistence, background task execution, and memory management on mobile devices?`;
            topic = 'Mobile Architecture & Concurrency';
          } else if (roleLower.includes('data') || roleLower.includes('ml') || roleLower.includes('ai') || roleLower.includes('machine learning')) {
            questionText = `To begin our technical rehearsal, how do you approach pipeline reliability, data validation, and handling schema drift when processing high-volume datasets?`;
            topic = 'Data Reliability & Schema Management';
          } else if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('cloud') || roleLower.includes('infra')) {
            questionText = `To begin our technical rehearsal, how do you design a zero-downtime deployment strategy with automated canary validation and rollback for critical microservices?`;
            topic = 'Deployment Strategy & Resiliency';
          } else {
            // General Software Engineer / Full Stack / Backend / Intern
            questionText = `To begin our technical rehearsal, when designing an API that handles high-throughput traffic, how do you approach database schema design and indexing strategy to ensure low latency as data volume scales?`;
            topic = 'Database Design & Indexing Strategy';
          }
        }
      }
    }

    const firstQuestion: Question = {
      id: 'q_1',
      text: questionText,
      topic,
      type: qType,
      difficulty: 'medium',
      timestamp: new Date().toISOString(),
    };

    return { introText, firstQuestion };
  }

  async evaluateAndGenerateNext(
    context: CandidateContext,
    previousQuestions: Question[],
    previousAnswers: Answer[],
    latestAnswer: Answer,
    currentQuestion: Question,
    elapsedSeconds?: number
  ): Promise<NextQuestionDecision> {
    const transcript = (latestAnswer.transcript || '').trim();
    const lower = transcript.toLowerCase();
    const questionCount = previousQuestions.length;

    // Simulate realistic inference processing delay
    await new Promise((r) => setTimeout(r, 600));

    // Curated 5-Question Behavioral Presentation Demo Flow
    if (context.isSampleDemo) {
      if (questionCount >= 5) {
        return {
          action: 'conclude',
          questionText: 'Thank you Kashish for sharing those detailed technical and project experiences. That concludes our 5-question interview rehearsal. I am now compiling your feedback and performance report.',
          topic: 'Closing',
          type: 'closing',
          evaluation: {
            understoodIntent: true,
            clarity: 'Strong',
            technicalAccuracy: 'Strong',
            extractedKeyPoints: ['Clear problem-solving strategy', 'Effective communication & technical depth'],
            requiresFollowUp: false,
            reasoningNote: 'Candidate demonstrated clear structured thinking, solid technical fundamentals, and effective problem solving across projects.',
          },
        };
      }

      const nextQ = SAMPLE_BEHAVIORAL_DEMO_QUESTIONS[questionCount];
      return {
        action: 'new_topic',
        questionText: nextQ.text,
        topic: nextQ.topic,
        type: nextQ.type,
        difficulty: nextQ.difficulty,
        evaluation: {
          understoodIntent: true,
          clarity: 'Strong',
          technicalAccuracy: 'Good',
          extractedKeyPoints: ['Structured STAR response', 'Concrete actions and ownership'],
          requiresFollowUp: false,
          reasoningNote: 'Candidate gave a clear behavioral example demonstrating ownership, collaboration, and measurable outcome.',
        },
      };
    }

    const targetQuestions = context.targetQuestions || (context.durationMinutes >= 30 ? 15 : context.durationMinutes >= 20 ? 10 : 6);
    const totalAllowedSeconds = (context.durationMinutes || 10) * 60;
    const isTimeDriven = elapsedSeconds !== undefined;
    const isTimeExpired = isTimeDriven && (elapsedSeconds >= totalAllowedSeconds || (totalAllowedSeconds - elapsedSeconds <= 75 && questionCount >= 3));

    // Determine completion: dynamically scales with chosen rehearsal duration or when scheduled time is up
    if (isTimeExpired || (!isTimeDriven && questionCount >= targetQuestions) || (context.targetQuestions && questionCount >= context.targetQuestions)) {
      return {
        action: 'conclude',
        questionText: `That concludes our scheduled ${context.durationMinutes}-minute rehearsal for today. Thank you for your thoughtful responses. I am preparing your detailed performance feedback now.`,
        topic: 'Closing',
        type: 'closing',
        evaluation: {
          understoodIntent: true,
          clarity: 'Good',
          technicalAccuracy: 'Good',
          extractedKeyPoints: ['Covered technical overview', 'Responded to follow-ups'],
          requiresFollowUp: false,
        },
      };
    }

    // Dynamic Entity & Concept Extraction from Candidate's Actual Speech
    const techPatterns: Record<string, string> = {
      postgresql: 'PostgreSQL',
      postgres: 'PostgreSQL',
      mongodb: 'MongoDB',
      mongo: 'MongoDB',
      redis: 'Redis',
      mysql: 'MySQL',
      dynamodb: 'DynamoDB',
      react: 'React',
      nextjs: 'Next.js',
      'next.js': 'Next.js',
      vue: 'Vue',
      angular: 'Angular',
      node: 'Node.js',
      nodejs: 'Node.js',
      express: 'Express',
      fastapi: 'FastAPI',
      django: 'Django',
      spring: 'Spring Boot',
      docker: 'Docker',
      kubernetes: 'Kubernetes',
      k8s: 'Kubernetes',
      aws: 'AWS',
      azure: 'Azure',
      graphql: 'GraphQL',
      kafka: 'Kafka',
      rabbitmq: 'RabbitMQ',
      typescript: 'TypeScript',
      python: 'Python',
      golang: 'Go',
      swift: 'Swift',
      flutter: 'Flutter',
    };

    const conceptPatterns: Record<string, string> = {
      'acid': 'ACID transaction guarantees',
      'relational': 'relational data schema',
      'schema': 'database schema modeling',
      'index': 'database indexing',
      'cache': 'caching layer',
      'caching': 'caching mechanisms',
      'microservice': 'microservice architecture',
      'latency': 'latency reduction',
      'throughput': 'high-throughput processing',
      'concurrency': 'concurrency handling',
      're-render': 'component re-rendering optimization',
      'state management': 'application state management',
      'rate limit': 'rate limiting and resilience',
      'error propagation': 'error handling and logging',
      'unit test': 'automated testing coverage',
      'security': 'security authorization',
      'conflict': 'technical disagreement',
      'disagree': 'differing engineering opinions',
      'deadline': 'deadline and delivery trade-offs',
    };

    const detectedTechs = Object.keys(techPatterns)
      .filter((k) => lower.includes(k))
      .map((k) => techPatterns[k]);

    const detectedConcepts = Object.keys(conceptPatterns)
      .filter((k) => lower.includes(k))
      .map((k) => conceptPatterns[k]);

    const allEntities = Array.from(new Set([...detectedTechs, ...detectedConcepts]));
    const hasResume = !!(context.resumeText && context.resumeText.trim().length > 0);
    const primaryEntity = allEntities[0] || (hasResume ? (context.interviewType === 'behavioural' ? 'your past project' : 'your technical architecture') : (context.interviewType === 'behavioural' ? 'your collaborative approach' : 'your technical approach'));

    // Assess the candidate's answer based on substance, trade-offs, and metrics
    const words = transcript.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const hasTradeoffs = /trade-?off|because|instead of|weighed|versus|alternative|decided|chose|reason/.test(lower);
    const hasMetrics = /\d+|%|percent|latency|seconds|ms|qps|users|improved|reduced|increased/.test(lower);
    const hasDeepTech = lower.includes('acid') || lower.includes('relational') || lower.includes('transaction') || lower.includes('concurrency') || lower.includes('latency');
    const isBrief = wordCount < 6 || transcript.length < 25;
    const isSubstantive = wordCount >= 35;

    const clarity: QualitativeScore = isBrief ? 'Needs Improvement' : isSubstantive ? 'Strong' : 'Good';
    const technicalAccuracy: QualitativeScore = isBrief
      ? 'Needs Improvement'
      : (hasDeepTech || hasTradeoffs)
      ? 'Strong'
      : 'Good';

    // Decide whether to probe (follow-up) or advance (new topic) based on assessment
    const wasFollowUp = currentQuestion && currentQuestion.type === 'follow_up';
    const previousQuestionTexts = previousQuestions.map((q) => q.text.toLowerCase().trim());
    const followUpsSoFar = previousQuestions.filter((q) => q.type === 'follow_up').length;

    // Normal interview flow:
    // 1. If it was NOT a follow up yet, follow up on the candidate's project/tech choices (!wasFollowUp).
    // 2. If it WAS already a follow up, only allow deepening if questionCount <= 2 and deep tech is introduced.
    // 3. Otherwise, strictly advance to a new topic to ensure diversity across competencies!
    const allowDeepenSpecialCase = wasFollowUp && hasDeepTech && questionCount <= 2 && followUpsSoFar < 2;
    let shouldFollowUp = !wasFollowUp || allowDeepenSpecialCase;

    if (shouldFollowUp) {
      let followUpQuestionText = '';
      let topic = `${primaryEntity} & Trade-offs`;
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

      if (isBrief) {
        difficulty = 'easy';
        topic = 'Answer Depth & Elaboration';
        followUpQuestionText = hasResume
          ? `You touched on ${primaryEntity}, but kept it fairly brief. Could you elaborate and walk me through the specific implementation steps, architecture choices, and concrete challenges you had to solve?`
          : `You touched on ${primaryEntity}, but kept it fairly brief. Could you elaborate on the underlying engineering principles, architecture choices, and concrete edge cases you would handle?`;
      } else if (lower.includes('postgres') || lower.includes('sql') || lower.includes('database') || lower.includes('relational') || lower.includes('acid')) {
        if (lower.includes('relational') || lower.includes('acid') || lower.includes('schema') || lower.includes('order') || lower.includes('user')) {
          difficulty = 'hard';
          topic = 'Database Scalability & Indexing';
          followUpQuestionText = `How would your database schema and indexing strategy evolve if the active user base and concurrent transactions scaled by 100x?`;
        } else {
          difficulty = 'medium';
          topic = 'Database Selection & Trade-offs';
          followUpQuestionText = hasResume
            ? `Why did you choose PostgreSQL for that project instead of a NoSQL store like MongoDB or DynamoDB?`
            : `Why would you choose PostgreSQL in this scenario instead of a NoSQL store like MongoDB or DynamoDB? What are the consistency and scaling trade-offs?`;
        }
      } else if (lower.includes('react') || lower.includes('frontend') || lower.includes('ui') || lower.includes('component')) {
        difficulty = 'medium';
        topic = 'Frontend Performance & State';
        followUpQuestionText = hasResume
          ? `In that React application, how did you handle component re-rendering and state management to prevent UI jank or performance bottlenecks?`
          : `In a client application with frequent state changes, how do you optimize component re-rendering and state management to prevent UI jank?`;
      } else if (lower.includes('node') || lower.includes('api') || lower.includes('backend') || lower.includes('endpoint')) {
        difficulty = 'medium';
        topic = 'API Reliability & Architecture';
        followUpQuestionText = `How did you handle error propagation, logging, and rate limiting across those backend endpoints?`;
      } else if (lower.includes('conflict') || lower.includes('disagree') || lower.includes('team') || lower.includes('deadline')) {
        difficulty = 'medium';
        topic = 'Conflict Resolution & Growth';
        followUpQuestionText = `Reflecting on that disagreement, what would you do differently if you encountered a similar clash of engineering opinions today?`;
      } else if (hasTradeoffs) {
        difficulty = 'hard';
        topic = `${primaryEntity} Edge Cases`;
        followUpQuestionText = `You explained the rationale for using ${primaryEntity}. What was the most critical failure mode or edge case you had to design around with that approach?`;
      } else {
        difficulty = 'medium';
        topic = `${primaryEntity} Trade-offs`;
        followUpQuestionText = `Regarding ${primaryEntity}, what were the technical trade-offs or constraints of that choice compared to alternative designs you considered?`;
      }

      // If this exact question was already asked previously, do not loop: advance to new topic instead
      const isAlreadyAsked = previousQuestionTexts.some((pt) => pt.includes(followUpQuestionText.toLowerCase().slice(0, 30)));
      if (!isAlreadyAsked) {
        return {
          action: 'follow_up',
          questionText: followUpQuestionText,
          topic,
          type: 'follow_up',
          difficulty,
          evaluation: {
            understoodIntent: true,
            clarity,
            technicalAccuracy,
            extractedKeyPoints: allEntities.length > 0 ? allEntities.slice(0, 3) : [hasResume ? 'Core project implementation' : 'Core architectural approach'],
            requiresFollowUp: true,
            reasoningNote: isBrief
              ? 'Answer was brief; prompting for technical depth and architecture.'
              : `Assessed strong points on ${primaryEntity}; probing architectural constraints and trade-offs.`,
          },
        };
      }
    }

    // New Topic: Dynamically selected and tailored to candidate's role and unaddressed competencies
    const coveredTopics = previousQuestions.map((q) => q.topic.toLowerCase());
    const coveredTexts = previousQuestions.map((q) => q.text.toLowerCase());
    const competencyPool = [
      {
        topic: 'System Observability & Incident Response',
        type: 'technical' as const,
        generate: () => `How do you approach debugging a high-latency issue when the root cause could be network, database, or application code?`,
      },
      {
        topic: 'Engineering Accountability & Growth',
        type: 'behavioural' as const,
        generate: () => `Tell me about a time you made an engineering mistake or broke something in production. How did you diagnose it and resolve the issue?`,
      },
      {
        topic: 'Engineering Pragmatism & Technical Debt',
        type: 'behavioural' as const,
        generate: () => `When designing software for ${context.company || 'a production system'}, how do you decide when to write clean, extensible code versus shipping quickly to meet a deadline?`,
      },
      {
        topic: 'Concurrency & Distributed Reliability',
        type: 'technical' as const,
        generate: () => `How do you ensure data consistency and prevent race conditions when designing asynchronous, distributed workflows or APIs?`,
      },
      {
        topic: 'Technical Influence & Conflict',
        type: 'behavioural' as const,
        generate: () => `Describe a situation where you had a strong technical disagreement with a teammate or lead. How did you resolve it constructively?`,
      },
      {
        topic: 'Application Security & Hardening',
        type: 'technical' as const,
        generate: () => `What security best practices do you incorporate into your code to guard against common vulnerabilities like injection, auth bypass, and data leaks?`,
      },
      {
        topic: 'Testing Strategy & Quality Assurance',
        type: 'technical' as const,
        generate: () => `How do you structure your automated testing strategy across unit, integration, and end-to-end tests for a mission-critical feature?`,
      },
      {
        topic: 'Quantifiable Impact & Ownership',
        type: 'behavioural' as const,
        generate: () => `Tell me about the most impactful feature or optimization you personally delivered. What were the concrete metrics or user outcomes?`,
      },
      {
        topic: 'Caching & Data Access Patterns',
        type: 'technical' as const,
        generate: () => `How do you approach caching strategies in a high-read web system, and how do you handle cache invalidation and cache stampedes?`,
      },
      {
        topic: 'Production Readiness & Observability',
        type: 'technical' as const,
        generate: () => `What metrics, logs, and alerts do you consider essential to monitor the health and reliability of a production service?`,
      },
    ];

    // Pick the first competency that has neither its topic nor its question text previously asked
    const availableCompetencies = competencyPool.filter((c) => {
      const topicWord = c.topic.toLowerCase().split(' ')[0];
      const isTopicCovered = coveredTopics.some((t) => t.includes(topicWord));
      const textSample = c.generate().toLowerCase();
      const isTextCovered = coveredTexts.some((ct) => ct.includes(textSample.slice(0, 30)));
      return !isTopicCovered && !isTextCovered;
    });

    const nextCompetency =
      availableCompetencies[0] ||
      competencyPool.find((c) => !coveredTexts.some((ct) => ct.includes(c.generate().toLowerCase().slice(0, 30)))) ||
      competencyPool[(questionCount - 1) % competencyPool.length];

    return {
      action: 'new_topic',
      questionText: nextCompetency.generate(),
      topic: nextCompetency.topic,
      type: nextCompetency.type,
      difficulty: 'medium',
      evaluation: {
        understoodIntent: true,
        clarity,
        technicalAccuracy,
        extractedKeyPoints: allEntities.length > 0 ? allEntities.slice(0, 3) : ['Solid preceding response'],
        requiresFollowUp: false,
        reasoningNote: `Candidate answered satisfactorily on ${currentQuestion.topic}; rotating to ${nextCompetency.topic}.`,
      },
    };
  }

  async generateFeedbackReport(
    context: CandidateContext,
    questions: Question[],
    answers: Answer[]
  ): Promise<FeedbackReportData> {
    const rawAnswers = answers.map((a) => (a.transcript || '').trim()).filter((t) => t.length > 0);
    const combinedAnswers = rawAnswers.join(' ').toLowerCase();
    const totalWords = combinedAnswers.split(/\s+/).filter(Boolean).length;
    const avgWordsPerAnswer = rawAnswers.length > 0 ? totalWords / rawAnswers.length : 0;
    const isBehavioral = context.interviewType === 'behavioural';

    // 1. Topic & Keyword extraction for grounded citations
    const detectedTopics: string[] = [];
    if (/react|vue|angular|frontend|css|ui|component|state/.test(combinedAnswers)) detectedTopics.push('frontend architecture and state management');
    if (/api|node|backend|express|service|endpoint|rest|graphql/.test(combinedAnswers)) detectedTopics.push('backend API services');
    if (/database|postgres|sql|nosql|mongo|redis|schema/.test(combinedAnswers)) detectedTopics.push('data storage and query modeling');
    if (/scale|latency|cache|performance|distributed|throughput/.test(combinedAnswers)) detectedTopics.push('scalability and latency optimization');
    if (/test|ci\/cd|deploy|docker|kubernetes|cloud|aws|azure/.test(combinedAnswers)) detectedTopics.push('deployment and cloud infrastructure');
    if (/team|conflict|disagree|lead|collaborat|stakeholder|mentor/.test(combinedAnswers)) detectedTopics.push('team collaboration and communication');
    if (/deadlines|priorit|agile|scrum|delivery|timeline/.test(combinedAnswers)) detectedTopics.push('project prioritization and delivery');

    // 2. Evaluation criteria
    const mentionsTradeoffs = /trade-?off|because|instead of|weighed|versus|alternative|decided|chose|reason/.test(combinedAnswers);
    const mentionsMetrics = /\d+|%|percent|latency|seconds|ms|qps|users|improved|reduced|increased/.test(combinedAnswers);
    const mentionsSTAR = /situation|task|action|result|impact|outcome|resolved|learned/.test(combinedAnswers);
    const hasEnoughDepth = avgWordsPerAnswer >= 30;
    const hasGreatDepth = avgWordsPerAnswer >= 60;

    // 3. Calibrated scores
    let technicalScore: QualitativeScore;
    let communicationScore: QualitativeScore;
    let interviewHandlingScore: QualitativeScore;

    if (rawAnswers.length === 0 || totalWords < 15) {
      technicalScore = 'Needs Improvement';
      communicationScore = 'Needs Improvement';
      interviewHandlingScore = 'Needs Improvement';
    } else if (isBehavioral) {
      technicalScore = mentionsSTAR && hasEnoughDepth ? 'Strong' : hasEnoughDepth ? 'Good' : 'Needs Improvement';
      communicationScore = hasGreatDepth ? 'Strong' : hasEnoughDepth ? 'Good' : 'Needs Improvement';
      interviewHandlingScore = answers.length >= 2 ? 'Good' : 'Needs Improvement';
    } else {
      if (hasGreatDepth && mentionsTradeoffs && detectedTopics.length >= 2) {
        technicalScore = 'Strong';
      } else if (hasEnoughDepth && (mentionsTradeoffs || detectedTopics.length >= 1)) {
        technicalScore = 'Good';
      } else {
        technicalScore = 'Needs Improvement';
      }

      communicationScore = hasGreatDepth ? 'Strong' : hasEnoughDepth ? 'Good' : 'Needs Improvement';
      interviewHandlingScore = answers.length >= 2 ? (hasEnoughDepth ? 'Good' : 'Needs Improvement') : 'Needs Improvement';
    }

    // 4. Grounded "What Went Well"
    const whatWentWell: string[] = [];
    if (detectedTopics.length > 0) {
      whatWentWell.push(`Directly discussed ${detectedTopics.slice(0, 2).join(' and ')} in your project experience.`);
    } else if (rawAnswers.length > 0) {
      whatWentWell.push('Shared real project background and addressed the core question prompts.');
    } else {
      whatWentWell.push('Engaged with the interviewer prompt.');
    }

    if (mentionsTradeoffs) {
      whatWentWell.push('Articulated reasoning and technical justification behind your decisions.');
    } else if (hasEnoughDepth) {
      whatWentWell.push('Maintained clear verbal flow and provided substantive explanations.');
    } else {
      whatWentWell.push('Kept answers focused and avoided irrelevant tangents.');
    }

    if (answers.length >= 3) {
      whatWentWell.push('Handled multi-part follow-up questions without losing conversational structure.');
    } else {
      whatWentWell.push('Listened attentively and responded promptly to each interviewer question.');
    }

    // 5. Accurate, actionable "What to Improve"
    const whatToImprove: string[] = [];
    if (!mentionsMetrics) {
      whatToImprove.push('Anchor your outcomes with concrete metrics (e.g. latency reduced by 30%, served 10k daily users, or delivered 2 weeks early).');
    }
    if (!mentionsTradeoffs && !isBehavioral) {
      whatToImprove.push('Highlight engineering trade-offs: explain alternative technologies or patterns you considered and why you rejected them.');
    }
    if (isBehavioral && !mentionsSTAR) {
      whatToImprove.push('Structure behavioral stories using the STAR method (Situation, Task, Action, Result) to spotlight your individual ownership.');
    }
    if (avgWordsPerAnswer < 35) {
      whatToImprove.push('Elaborate with greater technical depth: aim for 1–2 minutes per answer covering context, execution, and outcomes.');
    }
    if (whatToImprove.length < 3) {
      whatToImprove.push('Pause 2–3 seconds before speaking to mentally structure a 3-part answer before diving into implementation details.');
    }

    while (whatToImprove.length > 3) whatToImprove.pop();
    while (whatWentWell.length > 3) whatWentWell.pop();

    // 6. Next Rehearsal Focus
    let nextRehearsalFocus: string;
    if (technicalScore === 'Needs Improvement' || avgWordsPerAnswer < 30) {
      nextRehearsalFocus = isBehavioral
        ? 'Structure answers with the STAR method and provide concrete behavioral examples.'
        : 'Deliver structured answers explaining technical decisions and architectural trade-offs.';
    } else if (!mentionsMetrics) {
      nextRehearsalFocus = 'Incorporate measurable impact metrics and quantifiable results in every answer.';
    } else {
      nextRehearsalFocus = isBehavioral
        ? 'Practice framing leadership decisions and managing conflicting engineering priorities.'
        : 'Practice deep-dive architectural trade-offs under probing technical follow-ups.';
    }

    // 7. Calibrated summary verdict
    let summaryVerdict: string;
    if (technicalScore === 'Strong' && communicationScore === 'Strong') {
      summaryVerdict = `Outstanding rehearsal for ${context.role}. You demonstrated strong domain command, crisp communication, and clear technical rationale.`;
    } else if (technicalScore === 'Needs Improvement' || communicationScore === 'Needs Improvement') {
      summaryVerdict = `Fair foundation for ${context.role}, but answers lacked sufficient depth or structural clarity. Focus on expanding your answers with concrete reasoning and examples.`;
    } else {
      summaryVerdict = `Solid rehearsal for ${context.role}. Good technical communication throughout, with room to strengthen concrete trade-offs and quantifiable outcomes.`;
    }

    return {
      technicalScore,
      communicationScore,
      interviewHandlingScore,
      summaryVerdict,
      whatWentWell,
      whatToImprove,
      nextRehearsalFocus,
      completedAt: new Date().toISOString(),
    };
  }
}
