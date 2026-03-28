import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Loader2, 
  Newspaper, 
  History, 
  Zap
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
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

// Types & Components
import { BridgeOutput, HistoryItem, OperationType } from './types';
import { LandingPage } from './components/LandingPage';
import { ProfileSection } from './components/ProfileSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HistoryVault } from './components/HistoryVault';
import { AnalysisResult } from './components/AnalysisResult';
import { InputSection } from './components/InputSection';

/**
 * Main Application Component
 */
export default function App() {
  return (
    <ErrorBoundary>
      <NewsBridgeApp />
    </ErrorBoundary>
  );
}

/**
 * Core Application Logic
 */
function NewsBridgeApp() {
  // State Management
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
  const [copied, setCopied] = useState(false);

  // Refs
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string }), []);

  /**
   * Handle Firestore Errors with detailed logging
   */
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

  /**
   * Authentication Listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Real-time History Synchronization
   */
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

  /**
   * Connection Test (Health Check)
   */
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase connection failed: Client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  /**
   * Auth Actions
   */
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    signOut(auth);
    setShowProfile(false);
  };

  /**
   * Data Persistence
   */
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

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'news_analyses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news_analyses/${id}`);
    }
  };

  /**
   * Core Analysis Logic
   */
  const processInput = async (text: string, imageData?: string) => {
    if (!text.trim() || !user) return;
    
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
      
      // Scroll to result
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * UI Helpers
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); setVoiceStatus("Listening..."); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setVoiceStatus("Captured!");
      setTimeout(() => setVoiceStatus(""), 2000);
    };
    recognition.onerror = () => { setVoiceStatus("Error capturing speech."); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
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
    const lowerQuery = searchQuery.toLowerCase();
    return history.filter(item => 
      item.input.toLowerCase().includes(lowerQuery) ||
      item.output.intent.toLowerCase().includes(lowerQuery) ||
      item.output.summary.toLowerCase().includes(lowerQuery)
    );
  }, [history, searchQuery]);

  // Render Logic
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-black" size={48} aria-label="Loading application" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={login} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 min-h-screen flex flex-col relative">
      <AnimatePresence>
        {showProfile && (
          <ProfileSection user={user} onClose={() => setShowProfile(false)} onLogout={logout} />
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ink text-paper rounded-2xl shadow-xl">
            <Newspaper size={28} aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">NewsBridge</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">AI Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm ${showHistory ? 'bg-ink text-paper' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-expanded={showHistory}
            aria-controls="history-section"
          >
            <History size={20} aria-hidden="true" />
            <span className="hidden md:inline">History</span>
          </button>
          <button 
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-full border-2 border-gray-100 p-0.5 hover:ring-2 hover:ring-accent transition-all overflow-hidden shadow-sm"
            aria-label="Open profile"
          >
            <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover rounded-full" />
          </button>
        </div>
      </header>

      <main className="space-y-12 flex-grow">
        <InputSection 
          input={input}
          setInput={setInput}
          loading={loading}
          isListening={isListening}
          voiceStatus={voiceStatus}
          onProcess={processInput}
          onVoiceInput={handleVoiceInput}
          onImageUpload={handleImageUpload}
        />

        <AnimatePresence>
          {showHistory && (
            <HistoryVault 
              filteredHistory={filteredHistory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectItem={(item) => { setResult(item.output); setInput(item.input); setShowHistory(false); }}
              onDeleteItem={deleteHistory}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <AnalysisResult 
              result={result}
              copied={copied}
              onCopy={handleCopy}
              outputRef={outputRef}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 py-16 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
            <Newspaper size={20} aria-hidden="true" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">NewsBridge AI</span>
        </div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
          Intelligence Redefined • &copy; 2026
        </p>
      </footer>
    </div>
  );
}
