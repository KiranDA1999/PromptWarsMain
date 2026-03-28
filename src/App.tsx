import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Mic, 
  Image as ImageIcon, 
  Loader2, 
  AlertTriangle, 
  Newspaper, 
  ArrowRight, 
  History, 
  Trash2, 
  LogIn, 
  LogOut, 
  User, 
  Search, 
  X, 
  ChevronRight,
  ShieldCheck,
  Globe,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc,
  getDocFromServer
} from 'firebase/firestore';

// Types
interface BridgeOutput {
  intent: string;
  urgency: 'Low' | 'Medium' | 'High';
  summary: string;
  actions: string[];
  entities: string[];
  sources?: { title: string; uri: string }[];
}

interface HistoryItem {
  id: string;
  input: string;
  output: BridgeOutput;
  timestamp: number;
  uid: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// --- Components ---

const LandingPage = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] relative overflow-hidden">
    {/* Background Accents */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-3xl opacity-50" />

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-2xl z-10"
    >
      <div className="inline-block p-4 bg-black text-white rounded-[2rem] mb-8 shadow-2xl">
        <Newspaper size={48} />
      </div>
      <h1 className="text-6xl font-black tracking-tighter mb-6 leading-none">
        NewsBridge <span className="text-gray-400">AI</span>
      </h1>
      <p className="text-xl text-gray-500 mb-12 leading-relaxed">
        The ultimate bridge between messy news noise and actionable intelligence. 
        Powered by Google Gemini for real-time grounding and impact analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: <Zap className="text-orange-500" />, title: "Instant Analysis", desc: "From chaos to clarity in seconds." },
          { icon: <Globe className="text-blue-500" />, title: "Verified Sources", desc: "Grounded in real-time web search." },
          { icon: <ShieldCheck className="text-green-500" />, title: "Secure History", desc: "Your insights, cloud-synced & private." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onLogin}
        className="group flex items-center gap-3 bg-black text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-gray-800 transition-all shadow-2xl hover:scale-105 active:scale-95"
      >
        <LogIn size={24} />
        Get Started with Google
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>

    <footer className="absolute bottom-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">
      &copy; 2026 NewsBridge AI • Production Ready
    </footer>
  </div>
);

const ProfileSection = ({ user, onClose, onLogout }: { user: FirebaseUser, onClose: () => void, onLogout: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 p-8 flex flex-col border-l border-gray-100"
  >
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-2xl font-black tracking-tight">Profile</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X size={24} />
      </button>
    </div>

    <div className="flex flex-col items-center text-center mb-12">
      <div className="w-24 h-24 rounded-full border-4 border-gray-50 p-1 mb-4 shadow-lg overflow-hidden">
        <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-full" />
      </div>
      <h3 className="text-xl font-bold">{user.displayName}</h3>
      <p className="text-gray-400 text-sm mb-6">{user.email}</p>
      
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="p-4 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs font-bold text-green-600">Verified</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tier</p>
          <p className="text-xs font-bold text-black">Pro</p>
        </div>
      </div>
    </div>

    <div className="space-y-4 flex-grow">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Settings</p>
      <button className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-colors flex items-center justify-between group">
        <span className="font-medium">Security & Privacy</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
      </button>
      <button className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-colors flex items-center justify-between group">
        <span className="font-medium">Notification Preferences</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
      </button>
    </div>

    <button 
      onClick={onLogout}
      className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-[2rem] font-bold hover:bg-red-100 transition-all mt-auto"
    >
      <LogOut size={20} />
      Sign Out Securely
    </button>
  </motion.div>
);

// --- Error Boundary ---
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try refreshing the page.";
      try {
        const parsedError = JSON.parse(this.state.error?.message);
        if (parsedError.error?.includes("Missing or insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check your account status.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
          <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-2xl border border-red-100 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={64} />
            <h2 className="text-2xl font-black mb-4">Application Error</h2>
            <p className="text-gray-600 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <NewsBridgeApp />
    </ErrorBoundary>
  );
}

function NewsBridgeApp() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BridgeOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

  // Error Handler
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time History Sync
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'news_analyses'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          input: data.input,
          uid: data.uid,
          timestamp: data.timestamp,
          output: {
            intent: data.intent,
            urgency: data.urgency,
            summary: data.summary,
            actions: data.actions,
            entities: data.entities || []
          }
        };
      }) as HistoryItem[];
      setHistory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news_analyses');
    });

    return () => unsubscribe();
  }, [user]);

  // Test Connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    signOut(auth);
    setShowProfile(false);
  };

  const saveToFirestore = async (input: string, output: BridgeOutput) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'news_analyses'), {
        uid: user.uid,
        input,
        intent: output.intent,
        urgency: output.urgency,
        summary: output.summary,
        actions: output.actions,
        entities: output.entities || [],
        timestamp: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'news_analyses');
    }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'news_analyses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news_analyses/${id}`);
    }
  };

  const processInput = async (text: string, imageData?: string) => {
    if (!text.trim()) return;
    if (!user) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: `Convert the following messy news-related input into structured JSON with intent, entities, urgency, summary, and actions. Focus on interpreting news, assessing real-world impact, and guiding user decisions.
            Input: "${text}"` },
            ...(imageData ? [{ inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }] : [])
          ]
        },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              summary: { type: Type.STRING },
              actions: { type: Type.ARRAY, items: { type: Type.STRING } },
              entities: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["intent", "urgency", "summary", "actions"]
          }
        }
      });

      const data = JSON.parse(response.text) as BridgeOutput;
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter(Boolean);
      
      const finalResult = { ...data, sources };
      setResult(finalResult);
      saveToFirestore(text, finalResult);
      
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Processing error:", error);
      alert("Failed to analyze news. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setVoiceStatus("Captured!");
      setTimeout(() => setVoiceStatus(""), 2000);
    };

    recognition.onerror = () => {
      setVoiceStatus("Error capturing speech.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        processInput("Analyze this news image: " + input, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    return history.filter(item => 
      item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-black" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={login} />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col relative">
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <ProfileSection user={user} onClose={() => setShowProfile(false)} onLogout={logout} />
          </>
        )}
      </AnimatePresence>

      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-xl">
            <Newspaper size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">NewsBridge</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-500'}`}
            title="History"
          >
            <History size={20} />
          </button>
          <button 
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full border border-gray-100 p-0.5 hover:ring-2 hover:ring-black transition-all overflow-hidden"
            title="Profile"
          >
            <img src={user.photoURL || ''} alt="Profile" className="w-full h-full object-cover rounded-full" />
          </button>
        </div>
      </nav>

      <main className="space-y-8 flex-grow" role="main">
        {/* Input Section */}
        <section 
          className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-100 border border-gray-100"
          aria-labelledby="input-heading"
        >
          <h2 id="input-heading" className="sr-only">Input News Context</h2>
          <div className="space-y-6">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any news (e.g., 'bank collapse news is my money safe?')"
              className="w-full h-48 p-6 rounded-3xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none text-xl leading-relaxed"
              aria-label="Enter messy news text here"
            />
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => processInput(input)}
                disabled={loading || !input.trim()}
                className="flex-1 bg-black text-white font-bold py-5 px-8 rounded-3xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-black text-lg"
                aria-busy={loading}
              >
                {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <><Zap size={20} /> Analyze News</>}
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleVoiceInput}
                  className={`p-5 rounded-3xl border border-gray-100 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-black ${isListening ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'hover:bg-gray-50'}`}
                  title="Start Voice Input"
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                >
                  <Mic size={24} aria-hidden="true" />
                </button>

                <label 
                  className="p-5 rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black" 
                  title="Upload Image for Analysis"
                >
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" aria-label="Upload news image" />
                  <ImageIcon size={24} aria-hidden="true" />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center h-4 font-bold uppercase tracking-widest" role="status">{voiceStatus}</p>
          </div>
        </section>

        {/* History Section */}
        <AnimatePresence>
          {showHistory && (
            <motion.section 
              id="history-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              aria-labelledby="history-heading"
            >
              <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h2 id="history-heading" className="font-black text-2xl tracking-tight">Recent Intelligence</h2>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search history..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                    />
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">No matching analyses found.</p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list">
                    {filteredHistory.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => { setResult(item.output); setInput(item.input); setShowHistory(false); }}
                        className="w-full text-left p-6 bg-white rounded-3xl border border-gray-100 hover:border-black transition-all group focus:ring-2 focus:ring-black relative shadow-sm"
                        role="listitem"
                      >
                        <p className="font-bold text-lg line-clamp-1 mb-2 pr-10">{item.input}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.output.intent}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            item.output.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                            item.output.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {item.output.urgency}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => deleteItem(item.id, e)}
                          className="absolute top-6 right-6 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete analysis"
                        >
                          <Trash2 size={20} />
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div 
              ref={outputRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              role="region"
              aria-live="polite"
            >
              {result.urgency === 'High' && (
                <div 
                  className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-[2rem] flex items-start gap-5 animate-pulse"
                  role="alert"
                >
                  <AlertTriangle className="shrink-0" size={32} aria-hidden="true" />
                  <div>
                    <p className="font-black text-xl tracking-tight">High Urgency Detected</p>
                    <p className="text-sm font-medium opacity-90">Immediate impact assessment required. Review actions below.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <article className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Intent</p>
                  <p className="font-black text-2xl flex items-center gap-3">
                    <span className="p-3 bg-gray-50 rounded-2xl" aria-hidden="true">📰</span>
                    {result.intent}
                  </p>
                </article>
                <article className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Urgency</p>
                  <p className={`font-black text-2xl flex items-center gap-3 ${
                    result.urgency === 'High' ? 'text-red-600' : 
                    result.urgency === 'Medium' ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    <span className="p-3 bg-gray-50 rounded-2xl" aria-hidden="true">⚠️</span> {result.urgency}
                  </p>
                </article>
              </div>

              <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-50">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Structured Summary</h3>
                <p className="text-gray-700 leading-relaxed text-xl font-medium">{result.summary}</p>
                
                {result.sources && result.sources.length > 0 && (
                  <aside className="mt-10 pt-10 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Sources & Grounding</p>
                    <nav className="flex flex-wrap gap-3" aria-label="News sources">
                      {result.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm bg-gray-50 hover:bg-black hover:text-white text-gray-600 px-5 py-3 rounded-2xl transition-all flex items-center gap-3 font-bold border border-transparent hover:border-black"
                        >
                          {source.title}
                          <ArrowRight size={14} aria-hidden="true" />
                        </a>
                      ))}
                    </nav>
                  </aside>
                )}
              </section>

              <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-50">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Recommended Actions</h3>
                <div className="space-y-4" role="list">
                  {result.actions.map((action, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-50 group hover:border-black transition-all"
                      role="listitem"
                    >
                      <span className="flex-shrink-0 w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm group-hover:bg-black group-hover:text-white transition-all" aria-hidden="true">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 font-bold text-lg leading-snug">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 py-12 text-center border-t border-gray-50">
        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.4em]">
          &copy; 2026 NewsBridge AI • Intelligence Redefined
        </p>
      </footer>
    </div>
  );
}
