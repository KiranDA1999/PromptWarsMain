import React from 'react';
import { Loader2, Zap, Mic, Image as ImageIcon } from 'lucide-react';

interface InputSectionProps {
  input: string;
  setInput: (text: string) => void;
  loading: boolean;
  isListening: boolean;
  voiceStatus: string;
  onProcess: (text: string) => void;
  onVoiceInput: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  input,
  setInput,
  loading,
  isListening,
  voiceStatus,
  onProcess,
  onVoiceInput,
  onImageUpload
}) => (
  <section 
    className="bg-white rounded-5xl p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
    aria-labelledby="input-heading"
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" aria-hidden="true" />
    
    <h2 id="input-heading" className="sr-only">Input News Context</h2>
    <div className="space-y-8 relative z-10">
      <textarea 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a messy news snippet or ask a question..."
        className="w-full h-56 p-8 rounded-4xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all resize-none text-2xl font-medium leading-relaxed placeholder:text-gray-300"
        aria-label="Enter messy news text here"
      />
      
      <div className="flex flex-col md:flex-row gap-4">
        <button 
          onClick={() => onProcess(input)}
          disabled={loading || !input.trim()}
          className="flex-grow bg-ink text-paper font-black py-6 px-10 rounded-4xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4 shadow-2xl shadow-ink/20 focus:ring-4 focus:ring-accent/20 text-xl uppercase tracking-tight group"
          aria-busy={loading}
        >
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <><Zap size={24} className="group-hover:scale-125 transition-transform" aria-hidden="true" /> Analyze Intelligence</>}
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={onVoiceInput}
            className={`p-6 rounded-4xl border border-gray-100 transition-all focus:ring-4 focus:ring-accent/20 ${isListening ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'hover:bg-gray-50'}`}
            title="Start Voice Input"
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic size={28} aria-hidden="true" />
          </button>

          <label 
            className="p-6 rounded-4xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer focus-within:ring-4 focus-within:ring-accent/20" 
            title="Upload Image for Analysis"
          >
            <input type="file" onChange={onImageUpload} className="hidden" accept="image/*" aria-label="Upload news image" />
            <ImageIcon size={28} aria-hidden="true" />
          </label>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center h-4 font-black uppercase tracking-[0.4em] transition-opacity" role="status">{voiceStatus}</p>
    </div>
  </section>
);
