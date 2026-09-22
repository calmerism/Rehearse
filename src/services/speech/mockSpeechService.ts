import { ISpeechService } from './types';
import { sessionStore } from '@/services/storage/sessionStore';

export class MockSpeechService implements ISpeechService {
  private recognition: any = null;
  private isListeningActive = false;
  private currentTranscript = '';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechTimeout: NodeJS.Timeout | null = null;
  private static globalActiveAudio: HTMLAudioElement | null = null;
  private static globalActiveAudioUrl: string | null = null;
  private static globalAudioContext: any = null;
  private static globalActiveSource: any = null;
  private static globalSpeechId = 0;
  private static activeAbortController: AbortController | null = null;
  private static activeResolve: (() => void) | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static audioCache = new Map<string, ArrayBuffer>();

  /**
   * Pre-warms and unlocks the AudioContext synchronously inside user interaction events (clicks).
   * Prevents browser autoplay policies from blocking subsequent audio playback.
   */
  public static warmUpAudioContext(): void {
    if (typeof window === 'undefined') return;
    try {
      const ctx = MockSpeechService.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  }

  /**
   * Asynchronously pre-fetches and caches neural speech audio in memory.
   * Eliminates network latency and timeout risks for known static phrases (e.g. session conclusion).
   */
  public static async prefetch(text: string, voice?: string): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return;
    const cleanText = text.trim();
    if (!cleanText) return;

    try {
      const prefs = sessionStore.getPreferences();
      if (prefs.forceDemoMode) return;

      const voiceName = voice || prefs.voiceName || 'en-US-JennyNeural';
      const cacheKey = `${voiceName}:${cleanText}`;
      if (MockSpeechService.audioCache.has(cacheKey)) return;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (prefs.azureSpeechKey) headers['x-speech-key'] = prefs.azureSpeechKey;
      if (prefs.azureSpeechRegion) headers['x-speech-region'] = prefs.azureSpeechRegion;

      const res = await fetch('/api/speech/tts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: cleanText,
          voice: voiceName,
        }),
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          MockSpeechService.audioCache.set(cacheKey, arrayBuffer);
        }
      }
    } catch {
      // Pre-fetching in background is non-blocking
    }
  }

  /**
   * Determines if a browser SpeechSynthesisVoice is high-fidelity and non-robotic.
   */
  public static isNaturalVoice(voice: SpeechSynthesisVoice): boolean {
    const n = voice.name.toLowerCase();
    const roboticNames = [
      'david', 'zira', 'mark', 'desktop', 'albert', 'bad news', 'bahh',
      'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'fred', 'good news',
      'hysterical', 'junior', 'kathy', 'organ', 'ralph', 'superstar',
      'trinoids', 'whisper', 'wobble', 'zarvox', 'jester', 'pipe organ', 'victor'
    ];
    if (roboticNames.some((r) => n.includes(r))) return false;

    return (
      n.includes('siri') ||
      n.includes('natural') ||
      n.includes('neural') ||
      n.includes('online') ||
      n.includes('enhanced') ||
      n.includes('premium') ||
      n.includes('google us english') ||
      n.includes('google uk english female') ||
      n.includes('samantha') ||
      n.includes('ava')
    );
  }

  public static getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!MockSpeechService.globalAudioContext || MockSpeechService.globalAudioContext.state === 'closed') {
      try {
        MockSpeechService.globalAudioContext = new AudioCtx();
      } catch {
        return null;
      }
    }
    return MockSpeechService.globalAudioContext;
  }

  isRealAzure(): boolean {
    return false;
  }

  async initialize(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      MockSpeechService.getAvailableVoices().catch(() => {});
    }
    return true;
  }

  /**
   * Pre-fetches voices asynchronously, resolving once voiceschanged event has fired
   */
  public static async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (MockSpeechService.cachedVoices.length > 0) return MockSpeechService.cachedVoices;

    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      MockSpeechService.cachedVoices = current;
      return current;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        const v = window.speechSynthesis.getVoices();
        MockSpeechService.cachedVoices = v;
        resolve(v);
      };

      const timer = setTimeout(done, 400);
      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timer);
        done();
      };
    });
  }

  /**
   * Intelligently selects the highest-fidelity natural voice available
   */
  public static selectBestVoice(
    voices: SpeechSynthesisVoice[],
    preferredName?: string
  ): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // 1. Explicit user selection (exact or partial match)
    if (preferredName && preferredName !== 'Auto (Best Natural)') {
      const prefLower = preferredName.toLowerCase();
      const directMatch = voices.find(
        (v) =>
          v.name.toLowerCase() === prefLower ||
          v.voiceURI.toLowerCase() === prefLower ||
          v.name.toLowerCase().includes(prefLower)
      );
      if (directMatch) return directMatch;
    }

    // Filter out known legacy robotic / novelty synthesizers
    const roboticNames = [
      'david', 'zira', 'mark', 'desktop', 'albert', 'bad news', 'bahh',
      'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'fred', 'good news',
      'hysterical', 'junior', 'kathy', 'organ', 'ralph', 'superstar',
      'trinoids', 'whisper', 'wobble', 'zarvox', 'jester', 'pipe organ', 'victor'
    ];

    const englishVoices = voices.filter(
      (v) =>
        v.lang.startsWith('en') &&
        !roboticNames.some((r) => v.name.toLowerCase().includes(r))
    );

    if (englishVoices.length === 0) {
      const nonRobotic = voices.filter(
        (v) => !roboticNames.some((r) => v.name.toLowerCase().includes(r))
      );
      return nonRobotic.find((v) => v.lang.startsWith('en')) || nonRobotic[0] || null;
    }

    // Tier 1: Apple Siri & High-definition Enhanced/Premium Neural voices
    const tier1 = englishVoices.find((v) => {
      const n = v.name.toLowerCase();
      return (
        n.includes('siri') ||
        n.includes('premium') ||
        n.includes('enhanced') ||
        (n.includes('natural') && n.includes('online'))
      );
    });
    if (tier1) return tier1;

    // Tier 2: Google Chrome Cloud Neural (Google US English)
    const tier2 = englishVoices.find((v) => {
      const n = v.name.toLowerCase();
      return n.includes('google us english') || n.includes('google uk english female');
    });
    if (tier2) return tier2;

    // Tier 3: High-quality natural studio voices (Samantha, Daniel, Ava, Karen, Serena, Oliver, Fiona)
    const naturalHumanNames = [
      'samantha',
      'ava',
      'daniel',
      'karen',
      'serena',
      'tessa',
      'oliver',
      'reed',
      'flo',
      'eddy',
      'fiona',
      'moira',
      'rishi',
    ];
    const tier3 = englishVoices.find((v) => {
      const n = v.name.toLowerCase();
      return naturalHumanNames.some((h) => n.includes(h));
    });
    if (tier3) return tier3;

    // Tier 4: Default US English or first non-robotic English voice
    return englishVoices.find((v) => v.lang === 'en-US') || englishVoices[0] || null;
  }

  /**
   * Cleans punctuation, markdown, and formatting for natural, human speech cadence
   */
  private sanitizeForSpeech(text: string): string {
    return text
      .replace(/[*#_`~]/g, '') // strip markdown
      .replace(/•/g, '') // strip bullets
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/["“”]/g, '') // remove quotation marks that cause jarring pauses
      .replace(/\s+/g, ' ')
      .trim();
  }

  async startListening(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void
  ): Promise<void> {
    this.currentTranscript = '';
    this.isListeningActive = true;

    if (typeof window === 'undefined') return;

    // Check for native browser SpeechRecognition (Web Speech API)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (this.recognition) {
          try {
            this.recognition.abort();
          } catch {
            // ignore
          }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimText = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) {
              finalText += transcript + ' ';
            } else {
              interimText += transcript;
            }
          }

          if (finalText) {
            this.currentTranscript = (this.currentTranscript + ' ' + finalText).trim();
            onFinal(this.currentTranscript);
          } else if (interimText) {
            const combined = (this.currentTranscript + ' ' + interimText).trim();
            onInterim(combined);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // benign
            return;
          }
          console.warn('[MockSpeechService] SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            onError('Microphone access was denied. Please check your browser settings.');
          } else {
            onError('Speech recognition encountered an issue. You can also type your answers.');
          }
        };

        recognition.onend = () => {
          if (this.isListeningActive) {
            setTimeout(() => {
              if (this.isListeningActive && this.recognition === recognition) {
                try {
                  recognition.start();
                } catch {
                  // already started or aborted
                }
              }
            }, 120);
          }
        };

        this.recognition = recognition;
        recognition.start();
        return;
      } catch (e: any) {
        console.warn('[MockSpeechService] Error initializing browser SpeechRecognition:', e);
      }
    }

    console.info('[MockSpeechService] Web Speech recognition fallback active.');
  }

  async stopListening(): Promise<string> {
    this.isListeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    return this.currentTranscript.trim();
  }

  /**
   * Immediately stops any speech or audio across the entire application
   */
  public static stopAllAudio(): void {
    // 1. Invalidate any in-flight requests
    MockSpeechService.globalSpeechId++;
    if (MockSpeechService.activeAbortController) {
      try {
        MockSpeechService.activeAbortController.abort();
      } catch {}
      MockSpeechService.activeAbortController = null;
    }

    // 2. Stop and release Web Audio source
    if (MockSpeechService.globalActiveSource) {
      try {
        MockSpeechService.globalActiveSource.stop();
        MockSpeechService.globalActiveSource.disconnect();
      } catch {}
      MockSpeechService.globalActiveSource = null;
    }

    // 3. Stop and release HTML5 Audio
    if (MockSpeechService.globalActiveAudio) {
      try {
        MockSpeechService.globalActiveAudio.pause();
        MockSpeechService.globalActiveAudio.currentTime = 0;
        MockSpeechService.globalActiveAudio.src = '';
      } catch {}
      MockSpeechService.globalActiveAudio = null;
    }
    if (MockSpeechService.globalActiveAudioUrl) {
      try {
        URL.revokeObjectURL(MockSpeechService.globalActiveAudioUrl);
      } catch {}
      MockSpeechService.globalActiveAudioUrl = null;
    }

    // 4. Cancel browser Web Speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 5. Resolve any pending speak promise so callers do not freeze
    if (MockSpeechService.activeResolve) {
      const res = MockSpeechService.activeResolve;
      MockSpeechService.activeResolve = null;
      res();
    }
  }

  private async playAudioBuffer(
    arrayBuffer: ArrayBuffer,
    text: string,
    currentSpeechId: number,
    onSpeakingState?: (isSpeaking: boolean) => void
  ): Promise<void> {
    // A. High-fidelity Web Audio API buffer playback (Direct PCM, zero initial frame drop)
    const audioCtx = MockSpeechService.getAudioContext();
    if (audioCtx) {
      try {
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        if (currentSpeechId !== MockSpeechService.globalSpeechId) {
          return;
        }

        return await new Promise<void>((resolve) => {
          let settled = false;
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          MockSpeechService.globalActiveSource = source;

          const cleanup = () => {
            if (settled) return;
            settled = true;
            MockSpeechService.activeResolve = null;
            if (MockSpeechService.globalActiveSource === source) {
              MockSpeechService.globalActiveSource = null;
            }
            if (this.speechTimeout) {
              clearTimeout(this.speechTimeout);
              this.speechTimeout = null;
            }
            onSpeakingState?.(false);
            resolve();
          };

          MockSpeechService.activeResolve = () => {
            try {
              source.stop();
            } catch {}
            cleanup();
          };

          source.onended = cleanup;

          const durationMs = Math.max(audioBuffer.duration * 1000 + 400, 3000);
          this.speechTimeout = setTimeout(cleanup, durationMs);

          onSpeakingState?.(true);
          // Start playback with a slight 20ms audio scheduling lead
          source.start(audioCtx.currentTime + 0.02);
        });
      } catch (webAudioErr) {
        console.warn('[MockSpeechService] Web Audio decode failed, falling back to HTMLAudioElement:', webAudioErr);
      }
    }

    if (currentSpeechId !== MockSpeechService.globalSpeechId) {
      return;
    }

    // B. Fallback: HTML5 Audio Element
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    MockSpeechService.globalActiveAudioUrl = audioUrl;

    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    MockSpeechService.globalActiveAudio = audio;

    return await new Promise<void>((resolve) => {
      let settled = false;

      MockSpeechService.activeResolve = () => {
        if (settled) return;
        settled = true;
        onSpeakingState?.(false);
        resolve();
      };

      const cleanup = () => {
        if (settled) return;
        settled = true;
        MockSpeechService.activeResolve = null;
        if (this.speechTimeout) {
          clearTimeout(this.speechTimeout);
          this.speechTimeout = null;
        }
        onSpeakingState?.(false);
        if (MockSpeechService.globalActiveAudioUrl === audioUrl) {
          try {
            URL.revokeObjectURL(audioUrl);
          } catch {}
          MockSpeechService.globalActiveAudioUrl = null;
        }
        if (MockSpeechService.globalActiveAudio === audio) {
          MockSpeechService.globalActiveAudio = null;
        }
        resolve();
      };

      const maxDurationMs = Math.min(Math.max(text.length * 120, 5000), 30000);
      this.speechTimeout = setTimeout(cleanup, maxDurationMs);

      audio.onplay = () => {
        if (currentSpeechId === MockSpeechService.globalSpeechId) {
          onSpeakingState?.(true);
        }
      };
      audio.onended = cleanup;
      audio.onerror = () => cleanup();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[MockSpeechService] Audio play blocked or not supported:', err);
          cleanup();
        });
      }
    });
  }

  async speak(text: string, onSpeakingState?: (isSpeaking: boolean) => void): Promise<void> {
    if (typeof window === 'undefined') return;

    // Guaranteed: silence all previous audio before starting
    MockSpeechService.stopAllAudio();

    const cleanText = text.trim();
    if (!cleanText) return;

    const currentSpeechId = ++MockSpeechService.globalSpeechId;
    const abortController = new AbortController();
    MockSpeechService.activeAbortController = abortController;

    const prefs = sessionStore.getPreferences();
    const voiceName = prefs.voiceName || 'en-US-JennyNeural';
    const cacheKey = `${voiceName}:${cleanText}`;

    // 1. Instantaneous Cache Hit (0ms network latency for pre-fetched conclusion & questions)
    const cachedBuffer = MockSpeechService.audioCache.get(cacheKey);
    if (cachedBuffer && cachedBuffer.byteLength > 0) {
      if (currentSpeechId !== MockSpeechService.globalSpeechId) return;
      await this.playAudioBuffer(cachedBuffer, cleanText, currentSpeechId, onSpeakingState);
      return;
    }

    // 2. Microsoft Azure Neural TTS (studio-grade human voice)
    if (!prefs.forceDemoMode && typeof fetch === 'function') {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (prefs.azureSpeechKey) headers['x-speech-key'] = prefs.azureSpeechKey;
      if (prefs.azureSpeechRegion) headers['x-speech-region'] = prefs.azureSpeechRegion;

      const fetchTTS = async (): Promise<Response> => {
        return fetch('/api/speech/tts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: cleanText,
            voice: voiceName,
          }),
          signal: abortController.signal,
        });
      };

      try {
        let res: Response | null = null;
        try {
          res = await fetchTTS();
        } catch (firstErr: any) {
          if (firstErr.name === 'AbortError' || currentSpeechId !== MockSpeechService.globalSpeechId) {
            return;
          }
          // Quick retry for cold starts or momentary socket resets
          await new Promise((r) => setTimeout(r, 200));
          if (currentSpeechId !== MockSpeechService.globalSpeechId) return;
          res = await fetchTTS();
        }

        if (currentSpeechId !== MockSpeechService.globalSpeechId) {
          return;
        }

        if (res && res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          if (currentSpeechId !== MockSpeechService.globalSpeechId) {
            return;
          }

          if (arrayBuffer && arrayBuffer.byteLength > 0) {
            MockSpeechService.audioCache.set(cacheKey, arrayBuffer);
            await this.playAudioBuffer(arrayBuffer, cleanText, currentSpeechId, onSpeakingState);
            return;
          }
        }
      } catch (e: any) {
        if (e.name === 'AbortError' || currentSpeechId !== MockSpeechService.globalSpeechId) {
          return;
        }
        console.warn('[MockSpeechService] Azure TTS error:', e);
      }

      // If Azure TTS is online but fails, DO NOT degrade to robotic voice
      // unless browser has a verified natural neural voice available.
      if (currentSpeechId !== MockSpeechService.globalSpeechId) return;

      const voices = await MockSpeechService.getAvailableVoices();
      const selectedVoice = MockSpeechService.selectBestVoice(voices, prefs.voiceName);
      const isVoiceNatural = selectedVoice && MockSpeechService.isNaturalVoice(selectedVoice);

      if (!isVoiceNatural) {
        // Suppress robotic Windows/OS synthesizer to maintain interview quality
        console.info('[MockSpeechService] Natural voice unavailable; suppressing legacy robotic synthesizer.');
        onSpeakingState?.(true);
        const simulatedMs = Math.min(Math.max(cleanText.length * 45, 1200), 4500);
        await new Promise((r) => setTimeout(r, simulatedMs));
        onSpeakingState?.(false);
        return;
      }
    }

    if (currentSpeechId !== MockSpeechService.globalSpeechId) {
      return;
    }

    // 3. High-fidelity Web Speech fallback (used when forceDemoMode is enabled or natural voice verified)
    if ('speechSynthesis' in window) {
      const voices = await MockSpeechService.getAvailableVoices();
      const selectedVoice = MockSpeechService.selectBestVoice(voices, prefs.voiceName);

      return new Promise<void>((resolve) => {
        let settled = false;
        const safeResolve = () => {
          if (settled) return;
          settled = true;
          if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
            this.speechTimeout = null;
          }
          onSpeakingState?.(false);
          this.currentUtterance = null;
          resolve();
        };

        const maxDurationMs = Math.min(Math.max(cleanText.length * 85, 2500), 12000);
        this.speechTimeout = setTimeout(() => {
          safeResolve();
        }, maxDurationMs);

        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          onSpeakingState?.(true);

          const speechCleanText = this.sanitizeForSpeech(cleanText);
          const utterance = new SpeechSynthesisUtterance(speechCleanText);

          utterance.rate = prefs.speechRate ? Math.max(0.9, Math.min(prefs.speechRate, 1.2)) : 1.02;
          utterance.pitch = 1.0;

          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
          }

          utterance.onend = () => {
            safeResolve();
          };

          utterance.onerror = (e) => {
            console.warn('[MockSpeechService] Speech synthesis error:', e);
            safeResolve();
          };

          (window as any).__rehearseUtterance = utterance;
          this.currentUtterance = utterance;
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('[MockSpeechService] Exception during speak:', err);
          safeResolve();
        }
      });
    } else {
      onSpeakingState?.(true);
      const simulatedDurationMs = Math.min(Math.max(cleanText.length * 60, 2000), 7000);
      await new Promise((r) => setTimeout(r, simulatedDurationMs));
      onSpeakingState?.(false);
    }
  }

  stopSpeaking(): void {
    MockSpeechService.stopAllAudio();
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    this.currentUtterance = null;
  }
}
