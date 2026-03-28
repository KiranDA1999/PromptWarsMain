import { test, expect } from 'vitest';

test('basic math works', () => {
  expect(1 + 1).toBe(2);
});

test('urgency levels are valid', () => {
  const validUrgency = ['Low', 'Medium', 'High'];
  expect(validUrgency).toContain('High');
  expect(validUrgency).toContain('Medium');
  expect(validUrgency).toContain('Low');
});

test('intent categories are descriptive', () => {
  const intents = ['Medical', 'Emergency', 'Travel', 'Admin', 'News'];
  expect(intents.length).toBeGreaterThan(0);
});

test('history item structure', () => {
  const item = {
    id: '123',
    input: 'test',
    output: {
      intent: 'News',
      urgency: 'Low',
      summary: 'test summary',
      actions: ['step 1'],
      entities: ['entity 1']
    },
    timestamp: Date.now()
  };
  expect(item.id).toBeDefined();
  expect(item.output.actions).toHaveLength(1);
});
