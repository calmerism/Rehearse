import { IFoundryService } from './types';
import { FoundryService } from './foundryService';
import { MockFoundryService } from './mockFoundryService';
import { ApiFoundryService } from './apiFoundryService';

export function getFoundryService(
  forceMock = false,
  customCreds?: { endpoint?: string; apiKey?: string; model?: string }
): IFoundryService {
  if (forceMock || process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
    return new MockFoundryService();
  }

  // When running in the browser, delegate calls to Next.js API routes so server Azure credentials are used
  if (typeof window !== 'undefined') {
    return new ApiFoundryService();
  }

  // Server-side: check custom credentials or server environment variables
  const endpoint = customCreds?.endpoint || process.env.FOUNDRY_ENDPOINT;
  const apiKey = customCreds?.apiKey || process.env.FOUNDRY_API_KEY;
  const model = customCreds?.model || process.env.FOUNDRY_MODEL || 'gpt-4.1-mini';

  if (endpoint && apiKey && !endpoint.includes('your-foundry-resource') && !endpoint.includes('PASTE_YOUR')) {
    return new FoundryService({
      endpoint,
      apiKey,
      model,
    });
  }

  // Gracefully fallback to MockFoundryService if credentials are not provided
  return new MockFoundryService();
}

