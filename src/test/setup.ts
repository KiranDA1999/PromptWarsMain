import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocking window methods that are not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mocking SpeechRecognition
(window as any).SpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
}));

(window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
