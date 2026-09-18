import { ISpeechService } from './types';
import { MockSpeechService } from './mockSpeechService';
import { AzureSpeechService } from './azureSpeechService';

let activeSpeechService: ISpeechService | null = null;

export async function getSpeechService(_forceMock = false): Promise<ISpeechService> {
  if (!activeSpeechService) {
    activeSpeechService = new MockSpeechService();
  }
  return activeSpeechService;
}
