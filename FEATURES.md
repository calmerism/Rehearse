# Rehearse — Definitive Functional & Architectural Feature Specification

> A comprehensive technical and functional breakdown of the Rehearse autonomous interview rehearsal platform, detailing system architecture, intelligence engines, audio pipelines, evaluation mechanisms, dynamic duration pacing, and security design (excluding UI styling).

---

## 1. Executive Overview

**Rehearse** is an autonomous, real-time interview coaching engine designed to simulate high-stakes technical, behavioral, and mixed job interviews. Unlike conventional question banks or mock flashcard tools, Rehearse functions as an active conversational partner: it listens, analyzes candidate speech in real time, parses resumes to anchor inquiries in real engineering projects, generates adaptive follow-up questions on system trade-offs, enforces scheduled meeting durations (10m / 20m / 30m), synthesizes studio-grade neural audio, and produces comprehensive post-interview diagnostic evaluations.

---

## 2. Core Functional Features

```
                                  ┌───────────────────────────────┐
                                  │      Candidate Context        │
                                  │  (Role, Resume, Company, Gap) │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────┐     ┌────────────────────────────┐     ┌──────────────────────────────┐
│  Multi-Format Resume Parser  │────>│   Foundry AI Intelligence  │<───>│   Autonomous Agent Engine    │
│  (PDF / DOCX / TXT Parsing)  │     │   (GPT-4.1-mini Reasoning) │     │   (State Machine & Clock)    │
└──────────────────────────────┘     └────────────┬───────────────┘     └──────────────┬───────────────┘
                                                  │                                    │
                                                  ▼                                    ▼
                                     ┌────────────────────────────┐     ┌──────────────────────────────┐
                                     │ Azure Neural Voice Engine  │     │ Dual STT & Studio Camera     │
                                     │ (24kHz 160kbps MP3 Stream) │     │ (Live Voice & Local Video)   │
                                     └────────────────────────────┘     └──────────────────────────────┘
```

---

### Feature 1: Autonomous AI Interview Agent & Dynamic Lifecycle
The rehearsal is orchestrated by an autonomous event-driven finite state machine (`InterviewAgent`) that drives the candidate through an end-to-end interview without human intervention.

- **Reactive State Lifecycle**:
  - `thinking`: The model is analyzing candidate responses, querying the generative engine, and constructing the next follow-up.
  - `speaking`: The interviewer is actively verbalizing a prompt or follow-up question via studio-grade audio.
  - `listening`: The microphone is open and capturing live candidate answers with continuous transcription.
  - `idle`: The system is paused or preparing transitions.
- **Clock-Driven Pacing & Scheduled Duration Enforcement (10m / 20m / 30m)**:
  - Dynamically aligns pacing with the chosen meeting duration (e.g., 10 minutes, 20 minutes, or 30 minutes).
  - Rather than arbitrarily terminating after a static question count (which previously caused premature endings after 5 questions even when 8 minutes remained), the agent continuously evaluates actual elapsed time (`elapsedSeconds`) against `totalAllowedSeconds`.
  - Intelligently generates substantive technical questions as long as ample meeting time remains.
  - Smooth closing wrap-up: when remaining time is ≤ 75 seconds, the agent delivers a gracious, natural conclusion rather than initiating an unfinishable technical question.
  - Clock limit auto-finish: when elapsed time hits the scheduled limit, the interview concludes cleanly, capturing any in-flight candidate speech into `session.answers` and diagnostic scoring.
- **Resilient Fallbacks**:
  - Includes robust local fallback reasoning: if an external network timeout or cloud API glitch occurs, the agent seamlessly generates an intelligent in-character follow-up question so the rehearsal never abruptly aborts.

---

### Feature 2: Deep Resume Anchoring & Multi-Format Parsing
Rehearse completely eliminates generic "tell me about yourself" interview openers by deeply inspecting the candidate's real-world credentials.

- **Native Serverless Document Parsing**:
  - **PDF Parsing (`unpdf`)**: Extracts raw text from modern multi-column PDF resumes directly within serverless functions without requiring external microservices or binary dependencies.
  - **Word Document Parsing (`mammoth`)**: Parses `.docx` files by extracting structural text runs while discarding noisy XML formatting.
  - **Raw Text / Plain Text Support**: Supports immediate ingestion of `.txt` and pasted resumes.
- **Deep Anchoring Prompt Engineering**:
  - When resume text is grounded, the agent is strictly instructed to target prominent projects, technical architectures, and technologies listed in the document.
  - Generates questions such as: *"In your resume, you mention building a food delivery app with React and PostgreSQL. What architectural trade-offs led you to choose a relational database over a document store like MongoDB?"*
  - Automatically identifies key achievements and challenges the candidate to explain their personal contributions, system trade-offs, and failure recovery procedures.

---

### Feature 3: Adaptive Multi-Turn Questioning & Topic Rotation Engine
Rehearse operates on an intelligent iterative evaluation loop (`evaluateAndGenerateNext`), continually probing candidate depth while maintaining broad technical breadth.

- **Dynamic Follow-Up Generation**:
  - Listens for specific technical assertions made in the candidate's response (e.g., mention of database indexing, distributed locks, caching invalidation, or asynchronous messaging).
  - Rather than moving linearly to an unrelated pre-scripted question, the agent acts like a senior engineering leader by formulating an adaptive follow-up probing deeper into that specific topic.
- **Strict Topic Rotation & Anti-Repetition Intelligence**:
  - Prevents the interview from getting trapped in loops or obsessing over a single project/technology (e.g. repeatedly asking about PostgreSQL or vector databases across multiple turns).
  - Actively rotates inquiries across distinct engineering competencies: data modeling, caching/concurrency, distributed consensus, failure modes/reliability, observability, and team collaboration.
- **Multi-Track Interview Formats**:
  - **Technical**: Emphasizes architecture, system design, data modeling, algorithms, code trade-offs, and scaling bottlenecks.
  - **Behavioral**: Emphasizes the STAR method (Situation, Task, Action, Result), interpersonal collaboration, resolving technical conflict, and navigating ambiguous requirements.
  - **Mixed**: Alternates between technical foundation checks and behavioral execution scenarios.
- **Brief / Incomplete Answer Handling**:
  - If a candidate provides a response shorter than 15 words or omits technical reasoning, the model politely asks for elaboration rather than penalizing immediately.

---

### Feature 4: Studio-Grade Azure Cognitive Neural Speech Engine
The interviewer speaks with human-grade, warm, and natural conversational cadence, replacing mechanical device synthesizers with Microsoft Azure Cognitive Neural Speech.

- **Dedicated High-Fidelity Streaming Endpoint (`/api/speech/tts`)**:
  - Server-side REST streaming route connects directly to Microsoft Azure Cognitive Speech services.
  - Generates **24kHz 160kbps MP3 audio** (`audio-24khz-160kbitrate-mono-mp3`), offering pristine studio clarity free of artifacts.
- **AudioContext Pre-Warmup & Latency Optimization**:
  - Pre-warms the browser's `AudioContext` and decodes audio buffers cleanly, eliminating initial-playback latency and cutting out the 1-second initial audio clip.
- **Conversational SSML Prosody**:
  - Synthesizes speech using `<mstts:express-as style="chat">` SSML formatting.
  - Calibrated for natural pauses, conversational inflection, and warm interviewer demeanor.
- **Studio Voices Roster**:
  - **Jenny Neural** (`en-US-JennyNeural`): Warm, conversational & empathetic female interviewer *(Default)*.
  - **Guy Neural** (`en-US-GuyNeural`): Professional, articulate & confident male interviewer.
  - **Aria Neural** (`en-US-AriaNeural`): Dynamic, expressive & engaging.
  - **Davis Neural** (`en-US-DavisNeural`): Calm, authoritative & thoughtful.
  - **Ava Multilingual** (`en-US-AvaMultilingualNeural`): Modern, natural & clear.
  - **Andrew Multilingual** (`en-US-AndrewMultilingualNeural`): Articulate & dynamic.
  - **Sonia Neural** (`en-GB-SoniaNeural`) & **Ryan Neural** (`en-GB-RyanNeural`): Polished British accents.
- **Instant Audio Previews**:
  - Candidates can sample and test any voice directly from Settings or the Interview Lobby with a single click before starting a session.
- **Automatic Multi-Tier Fallback**:
  - If the candidate is offline or network-constrained, the engine gracefully falls back to browser Web Speech (prioritizing Apple Siri and Google Neural voices) so the rehearsal is never interrupted.

---

### Feature 5: Race-Condition Proof Anti-Overlap Audio Architecture
To eliminate speech stutter, double-speaking, and audio collisions during transitions, Rehearse employs an enterprise-grade audio pipeline:

```
[ New Speech Request / Navigation ]
              │
              ▼
  MockSpeechService.stopAllAudio()
  ├── 1. Invalidate globalSpeechId (globalSpeechId++)
  ├── 2. Abort in-flight network requests (activeAbortController.abort())
  ├── 3. Pause & reset HTMLAudioElement (audio.pause(); audio.src = '')
  ├── 4. Revoke ObjectURL blob memory (URL.revokeObjectURL(url))
  └── 5. Cancel browser speech queue (window.speechSynthesis.cancel())
              │
              ▼
  [ Play Clean, Single-Stream Audio ]
```

- **Unified Opening Utterance**:
  - The interview greeting (`introText`) and the first question (`firstQuestion.text`) are merged into **one single speech turn**:
    ```typescript
    const fullOpening = introText
      ? `${introText.trim()} ${firstQuestion.text.trim()}`
      : firstQuestion.text.trim();
    await this.speechService.speak(fullOpening);
    ```
  - Eliminates the two-request network race condition and delivers a human-like opening without pauses or queue collisions.
- **Global Static Audio Singleton**:
  - All audio instances across the app (Lobby preview, Settings preview, Live Interview) are coordinated through static audio references (`MockSpeechService.stopAllAudio()`).
  - Starting the interview immediately silences any audio preview that might have been playing.
- **Monotonic Invalidation Tokens**:
  - Each speech request increments `globalSpeechId`. If an earlier network fetch finishes late, it detects that its token is stale and immediately aborts rather than playing audio over a newer prompt.
- **React Lifecycle & StrictMode Defense**:
  - `initializedRef` in `LiveInterviewScreen` prevents duplicate agent creation on component remounts.
  - `isAborted` flag in `InterviewAgent` ensures aborted interviews cease all emissions and audio immediately.

---

### Feature 6: Dual Speech-to-Text (STT) & Studio Video Tile
Rehearse accommodates different candidate rehearsal styles and environments with an integrated multi-modal setup.

- **Continuous Voice Recognition**:
  - Real-time Speech-to-Text using native browser Web Speech and Azure Speech STS tokens.
  - Automatically captures live candidate speech and emits final transcripts upon natural speaking pauses.
- **Keyboard / Typed Answer Fallback**:
  - Candidates in noisy environments or without microphone access can toggle to text input at any moment.
  - Allows candidates to refine or type complex code snippets and architecture explanations manually.
- **Centered Studio Camera Preview**:
  - Real-time video preview using `navigator.mediaDevices.getUserMedia` positioned side-by-side with the interviewer wave tile in a balanced studio layout.
  - Smooth camera initialization without flickering or black screen interruptions.
  - 100% client-side: video streams run strictly in local browser memory and are never uploaded to external servers.

---

### Feature 7: Generative Evaluation & Targeted "Rehearse Again" Feedback Loop
Upon interview completion, Rehearse executes a diagnostic synthesis of all questions and candidate answers.

- **Three-Dimensional Diagnostic Scoring**:
  - **Technical Score** (`Needs Practice` | `Good` | `Strong`): Assesses accuracy, depth of knowledge, systems thinking, and architectural trade-off justification.
  - **Communication Score** (`Needs Practice` | `Good` | `Strong`): Assesses structure, clarity, conciseness, and structured delivery (e.g. STAR method).
  - **Interview Handling Score** (`Needs Practice` | `Good` | `Strong`): Assesses composure, answering the core question directly, and handling follow-up scrutiny.
- **Actionable Critique**:
  - **What Went Well**: Highlights strong answers, good architectural choices, and clear examples provided by the candidate.
  - **What to Improve**: Provides specific, constructive critique on weak answers or missing trade-offs.
- **Targeted Continuity Loop ("Rehearse Again")**:
  - The evaluation engine generates an explicit `nextRehearsalFocus` directive (e.g., *"Focus on explaining cache invalidation and distributed consistency trade-offs"*).
  - When the candidate clicks **"Rehearse Again"**, the platform carries forward their entire context (role, company, format, duration, grounded resume) and **seeds the priority gap into the next session's system prompt**.
  - Subsequent rehearsals specifically target the candidate's prior weaknesses to guarantee measurable improvement.

---

### Feature 8: Headless Serverless Security & Pre-Loaded Credentials
The application is architected for zero-configuration candidate onboarding with enterprise credential security.

- **Server-Side API Proxying**:
  - All generative intelligence calls and speech synthesis requests route through serverless API routes (`/api/interviews`, `/api/speech/tts`, `/api/speech/token`, `/api/resume/parse`).
  - No OpenAI, Azure AI Foundry, or Cognitive Services credentials are ever exposed in client bundles or network inspectors.
- **Multi-Service Azure AI Foundry Integration**:
  - Utilizes a unified Azure AI multi-service resource in `koreacentral`, combining GPT-4.1-mini reasoning with Azure Cognitive Speech Neural TTS through one secure key.
- **Turnkey Candidate Experience**:
  - Candidates never need to obtain, paste, or manage cloud API keys in settings. All configuration is preloaded in production environment variables.

---

### Feature 9: Typographic Refinement & Responsive Reading Geometry
The live rehearsal stage prioritizes visual serenity and cognitive focus, adhering to Apple human interface guidelines.

- **Uncluttered Typography**:
  - Removed decorative quotation marks wrapping technical questions, presenting clean, natural editorial headings.
- **Wide Reading Line-Length (`max-w-5xl`)**:
  - Expanded stage container to `max-w-[1240px]` and question wrapper to `max-w-5xl` with responsive side padding (`px-4 sm:px-8`).
  - Prevents tall, cramped 7-line blocks on desktop screens; long technical questions wrap effortlessly in 3–4 balanced lines.
- **Streamlined Settings Interface**:
  - Removed redundant candidate profile inputs to keep settings cleanly focused on Neural Voice selection, Custom AI Instructions, and Camera toggles.

---

## 3. System Architecture & Component Mapping

| Feature Area | Primary Implementation Files | Key Technologies |
| :--- | :--- | :--- |
| **Agent State Machine & Pacing** | [`src/agent/interviewAgent.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/agent/interviewAgent.ts) | TypeScript, EventEmitters, Clock Pacing FSM |
| **Generative AI & Reasoning** | [`src/services/foundry/foundryService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/foundry/foundryService.ts), [`apiFoundryService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/foundry/apiFoundryService.ts) | Microsoft Azure AI Foundry, GPT-4.1-mini, Topic Rotation |
| **Azure Neural Speech TTS** | [`src/app/api/speech/tts/route.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/app/api/speech/tts/route.ts), [`mockSpeechService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/speech/mockSpeechService.ts) | Azure Cognitive Speech, 24kHz MP3, SSML |
| **Speech-to-Text (STT)** | [`src/services/speech/mockSpeechService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/speech/mockSpeechService.ts), [`azureSpeechService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/speech/azureSpeechService.ts) | Web Speech API, Azure Speech SDK |
| **Resume Parser** | [`src/app/api/resume/parse/route.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/app/api/resume/parse/route.ts), [`resumeParserService.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/resume/resumeParserService.ts) | `unpdf`, `mammoth`, Buffer streams |
| **Rehearsal Persistence** | [`src/services/storage/sessionStore.ts`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/services/storage/sessionStore.ts) | Client-side encrypted LocalStorage schema |
| **Live Interview Orchestration** | [`src/components/interview/LiveInterviewScreen.tsx`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/components/interview/LiveInterviewScreen.tsx), [`InterviewLobby.tsx`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/components/lobby/InterviewLobby.tsx) | React 18 hooks, AudioContext, MediaStreams, Timer Clock |
| **Settings & Audio Controls** | [`src/components/settings/SettingsScreen.tsx`](file:///Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/src/components/settings/SettingsScreen.tsx) | Streamlined audio preferences, Voice testing |

---

## 4. Verification & Quality Standards

- **Automated Regression Suite**: **22 automated unit and integration tests passing** (`npm test`), verifying duration limits, topic rotation, resume extraction, agent lifecycle, neural voice prioritization, input validation, and context preservation across iterations.
- **Serverless Production Bundle**: Compiled and deployed cleanly via Next.js 14 on Vercel with zero runtime lint or build errors.
- **High Availability**: Dual-layer architecture provides graceful client-side fallbacks for both LLM reasoning and speech synthesis in the event of upstream network outages.
- **Live Production Deployment**: Hosted and continuously validated on Vercel at [getrehearse.vercel.app](https://getrehearse.vercel.app).
