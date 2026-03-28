import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, LogIn, ChevronRight, Zap, Globe, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-paper relative overflow-hidden">
    {/* Atmospheric Background */}
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] opacity-50" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] opacity-50" />

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-4xl z-10"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full mb-8 font-bold text-xs uppercase tracking-widest"
      >
        <Sparkles size={14} />
        Intelligence Redefined
      </motion.div>

      <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
        News<br />
        <span className="text-accent">Bridge</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
        The ultimate bridge between messy news noise and actionable intelligence. 
        Powered by Google Gemini for real-time grounding and impact analysis.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20">
        <button 
          onClick={onLogin}
          className="group flex items-center gap-4 bg-ink text-paper px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-800 transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          <LogIn size={24} />
          Start with Google
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="flex -space-x-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-12 h-12 rounded-full border-4 border-paper bg-gray-100 overflow-hidden shadow-sm">
              <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" />
            </div>
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-paper bg-ink text-paper flex items-center justify-center text-xs font-bold shadow-sm">
            +10k
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { icon: <Zap className="text-accent" />, title: "Instant Analysis", desc: "From chaos to clarity in seconds with AI-driven summaries." },
          { icon: <Globe className="text-blue-500" />, title: "Verified Sources", desc: "Grounded in real-time web search for maximum accuracy." },
          { icon: <ShieldCheck className="text-green-500" />, title: "Secure History", desc: "Your insights are cloud-synced, private, and always accessible." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 bg-white/50 backdrop-blur-sm rounded-4xl border border-gray-100 hover:border-accent/30 transition-all hover:shadow-xl group"
          >
            <div className="mb-6 p-3 bg-gray-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    <footer className="absolute bottom-8 w-full text-center">
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
        &copy; 2026 NewsBridge AI • Built for the Future
      </p>
    </footer>
  </div>
);
