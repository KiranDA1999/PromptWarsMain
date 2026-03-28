import React from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Share2, Globe, ExternalLink } from 'lucide-react';
import { BridgeOutput } from '../types';

interface AnalysisResultProps {
  result: BridgeOutput;
  copied: boolean;
  onCopy: (text: string) => void;
  outputRef: React.RefObject<HTMLDivElement | null>;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  copied,
  onCopy,
  outputRef
}) => (
  <motion.div 
    ref={outputRef}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
    role="region"
    aria-label="Analysis Result"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <article className="md:col-span-2 bg-white p-10 rounded-5xl border border-gray-100 shadow-2xl shadow-gray-200/50">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Analysis Result</p>
            <h2 className="text-4xl font-black tracking-tighter uppercase">{result.intent}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onCopy(result.summary)}
              className="p-4 bg-gray-50 hover:bg-accent hover:text-paper rounded-3xl transition-all relative group"
              title="Copy Summary"
              aria-label="Copy summary to clipboard"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-paper text-[10px] px-3 py-1 rounded-full font-bold">
                  Copied!
                </span>
              )}
            </button>
            <button 
              className="p-4 bg-gray-50 hover:bg-ink hover:text-paper rounded-3xl transition-all"
              aria-label="Share analysis"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="prose prose-xl max-w-none">
          <p className="text-gray-700 leading-relaxed font-medium text-xl">{result.summary}</p>
        </div>

        {result.sources && result.sources.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Verified Sources</p>
            <div className="flex flex-wrap gap-3" role="list">
              {result.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-gray-50 hover:bg-ink text-gray-600 hover:text-paper px-6 py-4 rounded-3xl transition-all font-bold text-sm border border-transparent"
                  role="listitem"
                >
                  <Globe size={16} className="text-gray-300 group-hover:text-accent" aria-hidden="true" />
                  {source.title}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      <aside className="space-y-8">
        <div className="bg-ink text-paper p-10 rounded-5xl shadow-2xl shadow-ink/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 relative z-10">Urgency Level</p>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              result.urgency === 'High' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 
              result.urgency === 'Medium' ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 
              'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            }`} aria-hidden="true" />
            <span className="text-4xl font-black tracking-tighter uppercase">{result.urgency}</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-5xl border border-gray-100 shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Recommended Actions</p>
          <div className="space-y-4" role="list">
            {result.actions.map((action, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-5 p-5 bg-gray-50 rounded-4xl border border-transparent hover:border-accent/30 transition-all group"
                role="listitem"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-ink group-hover:text-paper transition-all" aria-hidden="true">
                  {idx + 1}
                </span>
                <p className="text-gray-700 font-bold text-sm leading-snug">{action}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {result.entities.length > 0 && (
          <div className="bg-white p-10 rounded-5xl border border-gray-100 shadow-xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Key Entities</p>
            <div className="flex flex-wrap gap-2" role="list">
              {result.entities.map((entity, idx) => (
                <span key={idx} className="px-4 py-2 bg-gray-50 rounded-2xl text-xs font-bold text-gray-500 border border-gray-100" role="listitem">
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  </motion.div>
);
