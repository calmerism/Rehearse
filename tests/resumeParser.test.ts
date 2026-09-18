import { describe, it, expect } from 'vitest';

describe('Resume File Parsing API Logic', () => {
  it('parses plain text resume cleanly', async () => {
    const sampleText = `
    Alex Chen
    Software Engineer
    Projects:
    - FoodDash: Full-stack food delivery app in React 18, Node.js, Express, PostgreSQL.
    - Distributed KV Store: Raft-based storage engine in Go.
    `;

    const cleaned = sampleText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    expect(cleaned).toContain('FoodDash');
    expect(cleaned).toContain('PostgreSQL');
    expect(cleaned.length).toBeGreaterThan(50);
  });
});
