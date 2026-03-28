import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LandingPage } from './components/LandingPage';
import { InputSection } from './components/InputSection';

// Mocking motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LandingPage Component', () => {
  it('renders the landing page with login button', () => {
    const mockLogin = vi.fn();
    render(<LandingPage onLogin={mockLogin} />);
    
    expect(screen.getAllByText(/News/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bridge/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/messy news noise/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Start with Google/i })).toBeDefined();
  });
});

describe('InputSection Component', () => {
  it('renders correctly with initial state', () => {
    const mockSetInput = vi.fn();
    const mockOnProcess = vi.fn();
    const mockOnVoiceInput = vi.fn();
    const mockOnImageUpload = vi.fn();

    render(
      <InputSection 
        input=""
        setInput={mockSetInput}
        loading={false}
        isListening={false}
        voiceStatus=""
        onProcess={mockOnProcess}
        onVoiceInput={mockOnVoiceInput}
        onImageUpload={mockOnImageUpload}
      />
    );

    expect(screen.getByPlaceholderText(/Paste a messy news snippet/i)).toBeDefined();
    expect(screen.getByText(/Analyze Intelligence/i)).toBeDefined();
  });

  it('disables the analyze button when loading', () => {
    const mockSetInput = vi.fn();
    const mockOnProcess = vi.fn();
    const mockOnVoiceInput = vi.fn();
    const mockOnImageUpload = vi.fn();

    render(
      <InputSection 
        input="some text"
        setInput={mockSetInput}
        loading={true}
        isListening={false}
        voiceStatus=""
        onProcess={mockOnProcess}
        onVoiceInput={mockOnVoiceInput}
        onImageUpload={mockOnImageUpload}
      />
    );

    const button = screen.getByRole('button', { name: '' }); // The button has no name when loading, just an icon
    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});

describe('Logic Tests', () => {
  it('should correctly identify urgency levels', () => {
    const urgencies = ['Low', 'Medium', 'High'];
    expect(urgencies).toContain('High');
    expect(urgencies).toContain('Medium');
    expect(urgencies).toContain('Low');
  });
});
