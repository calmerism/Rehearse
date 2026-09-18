export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface ISpeechService {
  /**
   * Initializes speech service (checks support/permissions or fetches token)
   */
  initialize(): Promise<boolean>;

  /**
   * Starts live recognition from microphone
   * @param onInterim Callback for partial transcripts
   * @param onFinal Callback when utterance is recognized
   * @param onError Callback on speech recognition error
   */
  startListening(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void
  ): Promise<void>;

  /**
   * Stops listening
   */
  stopListening(): Promise<string>;

  /**
   * Synthesizes text into spoken audio
   * @param text Text for AI interviewer to speak
   * @param onSpeakingState Callback when audio begins and ends
   */
  speak(text: string, onSpeakingState?: (isSpeaking: boolean) => void): Promise<void>;

  /**
   * Stops any currently playing speech synthesis
   */
  stopSpeaking(): void;

  /**
   * Whether this is running as Azure Speech or Mock/WebSpeech
   */
  isRealAzure(): boolean;
}
