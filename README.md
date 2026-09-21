<img src="public/rehearse.png" alt="Rehearse" width="220" />

Practice the interview, not just the questions.

A group project built for Azure AI-103 by Sukhraj, Aditya Goyal, Vansh, and Kashish.

https://getrehearse.vercel.app

Most engineering interview prep boils down to grinding LeetCode or memorizing definitions from a flashcard deck. That works fine for coding syntax tests, but it does almost nothing to prepare you for what an actual technical interview feels like.

When a senior engineer asks you why you chose PostgreSQL over MongoDB for an order service, or how you would handle 100x write traffic on a Friday evening, you cannot lean on a unit test runner. You have to explain your thought process out loud, justify your trade-offs, and handle follow-up scrutiny in real time.

Rehearse gives you a place to practice that verbal back-and-forth before it counts.


## How it works

You speak into your microphone. Rehearse listens, transcribes your answer in real time, and responds with spoken audio using Azure Neural Voice.

Instead of running down a generic checklist of questions, the interviewer adapts to what you actually say:
- Mention ACID guarantees, and it probes how your system behaves during a network partition.
- Mention sharding, and it asks how you deal with hot partitions and cross-shard queries.
- Mention Redis, and it asks about your cache invalidation strategy when writes spike.

It keeps track of time just like a real interview (10, 20, or 30 minutes) and moves between topics so you get a well-rounded conversation covering architecture, databases, concurrency, and teamwork.

If you upload a resume (PDF or DOCX), it pulls from your actual past projects and tech stack instead of asking hypothetical questions.


## Targeted practice

At the end of each session, you get feedback broken down into three areas:
- Technical correctness: Did you explain the concepts accurately?
- Trade-off articulation: Did you justify your decisions and weigh alternatives?
- Communication: Was your answer structured and clear?

If you hit Rehearse Again, Rehearse automatically takes the biggest gap identified in that round and brings it up in the next interview. That way you spend time fixing the specific things you struggle to explain out loud.


## Privacy

Your camera feed stays entirely inside your browser using local WebRTC. No video frames are ever recorded, streamed, or uploaded to any server.

Your speech audio is streamed only for real-time transcription and synthesis. We do not run facial emotion tracking, eye-contact metrics, or speculative behavioral scores. The feedback is based purely on what you say and how you defend your technical choices.


## Running locally

### Requirements
- Node.js 18 or later
- npm or yarn

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/calmerism/Rehearse.git
cd Rehearse
npm install
```

Create a `.env.local` file with your Azure credentials:

```env
AZURE_SPEECH_KEY="your_azure_speech_key"
AZURE_SPEECH_REGION="koreacentral"
FOUNDRY_ENDPOINT="https://your-resource.openai.azure.com/"
FOUNDRY_API_KEY="your_foundry_api_key"
FOUNDRY_MODEL="gpt-4o"
```

If you do not have Azure keys handy, you can leave them empty. Rehearse includes a built-in demo mode that uses your browser's native Web Speech API and local reasoning heuristics, so you can still run and test the full interview loop offline.

Start the local server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Run tests:

```bash
npm test
```


## Built with

- Next.js 14 (App Router)
- TypeScript
- Azure Cognitive Speech Services (Continuous STT and Neural TTS)
- Microsoft Foundry / Azure OpenAI (GPT-4o)
- Tailwind CSS
- Framer Motion
- Vitest


## License

MIT
