# Rehearse

Practice the interview, not just the questions.

Rehearse is an autonomous, voice-driven AI technical interview simulator. It simulates the conversational dynamics of a real engineering interview: candidates speak their answers into a microphone, and an autonomous AI interviewer listens, challenges technical trade-offs in real time, and responds with natural 24kHz neural speech.

At the end of each session, Rehearse generates a multi-dimensional diagnostic report and provides a closed-loop practice engine: candidates can click **"Rehearse Again"**, and their diagnosed weaknesses are automatically pre-seeded into the opening challenge of their next session.

[Live Application: getrehearse.vercel.app](https://getrehearse.vercel.app)

---

## Why Rehearse?

Most interview preparation platforms test syntax in isolation: candidates solve coding puzzles on LeetCode or memorize answers from static question banks. 

In actual technical interviews, senior engineers test how you **verbally articulate and defend architectural decisions under pressure**:
- *“You chose PostgreSQL for order processing. Why not MongoDB or DynamoDB?”*
- *“Under a distributed network partition, how does your write path handle CAP theorem trade-offs?”*
- *“If transactions scale by 100x tomorrow, where does your system break first?”*

Candidates regularly struggle not from a lack of technical knowledge, but because they have never rehearsed live verbal defense. Rehearse provides that high-fidelity practice environment.

---

## Key Features

- **Spoken Conversation (Azure AI Speech)**: Continuous real-time speech-to-text with silence detection, paired with studio-grade 24kHz neural speech synthesis (`JennyNeural`, `GuyNeural`, `AvaNeural`).
- **Adaptive Generative Scrutiny (Microsoft Foundry & GPT-4o)**: The AI does not ask generic scripted questions. It evaluates candidate answers in real time, extracts technical entities, and issues targeted follow-ups that challenge architectural trade-offs.
- **Autonomous Meeting Dynamics**: Enforces realistic meeting durations (10m, 20m, 30m) with an autonomous state machine that paces the conversation, signals time warnings, and orchestrates a natural wrap-up.
- **5-Pillar Topic Rotation**: Systematically rotates questions across high-level architecture, data stores, concurrency, observability, and team collaboration to ensure holistic evaluation.
- **Resume Grounding**: Upload a PDF or DOCX resume to anchor questions directly in your real projects, technologies, and work history.
- **Diagnostic Qualitative Scoring**: Evaluates answers across Technical Correctness, System Trade-Off Articulation, and Spoken Clarity.
- **Closed-Loop "Rehearse Again"**: Diagnosed gaps automatically pre-seed the opening challenge of your next session for deliberate, targeted improvement.
- **Client-Side Video Privacy**: Video camera streams run 100% locally in the browser via WebRTC `getUserMedia()`. Zero video frames are recorded or sent to cloud servers.
- **Offline Fallback Engine**: If cloud services are unavailable, the application gracefully switches to browser Web Speech API and heuristic reasoning with zero downtime.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Serverless Routes)
- **Language**: TypeScript (Strict type safety)
- **AI & Reasoning**: Microsoft Foundry / Azure OpenAI (GPT-4o)
- **Speech Services**: Azure Cognitive Speech SDK (Continuous STT & Neural TTS)
- **Audio Processing**: Web Audio API (Live Analyser Waveforms)
- **Document Intelligence**: `unpdf` (Wasm PDF parsing) & `mammoth` (DOCX extraction)
- **Styling**: Tailwind CSS with Apple-inspired design system
- **Motion**: Framer Motion (Critically damped springs)
- **Testing**: Vitest & React Testing Library (25 automated tests)

---

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/calmerism/AI-103-Rehearse.git
cd AI-103-Rehearse
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Azure Cognitive Speech Services
AZURE_SPEECH_KEY="your_azure_speech_key"
AZURE_SPEECH_REGION="koreacentral"

# Microsoft Foundry / Azure OpenAI
FOUNDRY_ENDPOINT="https://your-resource.openai.azure.com/"
FOUNDRY_API_KEY="your_foundry_api_key"
FOUNDRY_MODEL="gpt-4o"
```
*(Note: If cloud keys are not provided, Rehearse automatically runs in Demo Mode using the browser's built-in Web Speech API and local heuristic reasoning).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Type Checking & Production Build
```bash
npx tsc --noEmit
npm run build
```

---

## Privacy & Responsible AI

- **Zero Cloud Video**: Candidate webcam video is handled strictly in the browser using HTML5 `<video>` and WebRTC `getUserMedia()`. No camera feeds are uploaded or stored.
- **Token Encapsulation**: Azure Speech subscription keys are kept server-side; browser clients authenticate via 10-minute ephemeral tokens issued by Azure STS.
- **No Pseudo-Science**: Scoring is grounded entirely in observable technical arguments and trade-off articulation, without facial emotion analysis or speculative behavioral claims.
- **Candidate Agency**: Complete control over microphone vs. keyboard input, camera toggle, question skipping, and session duration.

---

## License

MIT License.
