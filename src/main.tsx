import { GoogleGenAI, Type } from "@google/genai";
import './index.css';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// Types
interface BridgeOutput {
  intent: string;
  urgency: 'Low' | 'Medium' | 'High';
  summary: string;
  actions: string[];
  entities: string[];
}

// DOM Elements
const messyInput = document.getElementById('messy-input') as HTMLTextAreaElement;
const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
const voiceBtn = document.getElementById('voice-btn') as HTMLButtonElement;
const imageInput = document.getElementById('image-input') as HTMLInputElement;
const loader = document.getElementById('loader') as HTMLDivElement;
const voiceStatus = document.getElementById('voice-status') as HTMLParagraphElement;
const emergencyBanner = document.getElementById('emergency-banner') as HTMLDivElement;
const outputSection = document.getElementById('output-section') as HTMLDivElement;
const outputIntent = document.getElementById('output-intent') as HTMLParagraphElement;
const outputUrgency = document.getElementById('output-urgency') as HTMLParagraphElement;
const outputSummary = document.getElementById('output-summary') as HTMLDivElement;
const outputActions = document.getElementById('output-actions') as HTMLUListElement;

// AI Logic
async function processInput(text: string, imageData?: string) {
  setLoading(true);
  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `Convert the following messy real-world input into structured JSON with:
intent, entities, urgency, summary, actions. Be concise and accurate.
Input: "${text}"`;

    const contents: any = { parts: [{ text: prompt }] };
    
    if (imageData) {
      contents.parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, description: "Category of intent (e.g. Medical, Emergency, Travel, Admin)" },
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            summary: { type: Type.STRING, description: "A concise structured summary of the input" },
            actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step actionable items" },
            entities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key entities extracted" }
          },
          required: ["intent", "urgency", "summary", "actions"]
        }
      }
    });

    const result = JSON.parse(response.text) as BridgeOutput;
    displayResult(result);
  } catch (error) {
    console.error("Processing error:", error);
    alert("Failed to process input. Please try again.");
  } finally {
    setLoading(false);
  }
}

function displayResult(result: BridgeOutput) {
  outputSection.classList.remove('hidden');
  
  // Intent & Urgency
  outputIntent.textContent = `🧠 ${result.intent}`;
  outputUrgency.textContent = `⚠️ ${result.urgency}`;
  
  // Urgency Styling
  outputUrgency.className = 'font-semibold text-lg ' + (
    result.urgency === 'High' ? 'text-red-600' : 
    result.urgency === 'Medium' ? 'text-orange-500' : 'text-green-600'
  );

  // Emergency Banner
  if (result.urgency === 'High') {
    emergencyBanner.classList.remove('hidden');
  } else {
    emergencyBanner.classList.add('hidden');
  }

  // Summary
  outputSummary.textContent = result.summary;

  // Actions
  outputActions.innerHTML = '';
  result.actions.forEach(action => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100';
    li.innerHTML = `
      <span class="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
        ${result.actions.indexOf(action) + 1}
      </span>
      <span class="text-sm">${action}</span>
    `;
    outputActions.appendChild(li);
  });

  // Scroll to output
  outputSection.scrollIntoView({ behavior: 'smooth' });
}

function setLoading(isLoading: boolean) {
  if (isLoading) {
    loader.classList.remove('hidden');
    processBtn.disabled = true;
    processBtn.classList.add('opacity-70');
  } else {
    loader.classList.add('hidden');
    processBtn.disabled = false;
    processBtn.classList.remove('opacity-70');
  }
}

// Event Listeners
processBtn.addEventListener('click', () => {
  const text = messyInput.value.trim();
  if (text) {
    processInput(text);
  } else {
    alert("Please enter some text first.");
  }
});

// Voice Input
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    voiceStatus.textContent = "Listening...";
    voiceBtn.classList.add('bg-red-50', 'border-red-200', 'text-red-500');
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    messyInput.value = transcript;
    voiceStatus.textContent = "Speech captured!";
    setTimeout(() => voiceStatus.textContent = "", 2000);
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error:", event.error);
    voiceStatus.textContent = "Error capturing speech.";
    voiceBtn.classList.remove('bg-red-50', 'border-red-200', 'text-red-500');
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('bg-red-50', 'border-red-200', 'text-red-500');
    if (voiceStatus.textContent === "Listening...") {
      voiceStatus.textContent = "";
    }
  };

  voiceBtn.addEventListener('click', () => {
    recognition.start();
  });
} else {
  voiceBtn.style.display = 'none';
}

// Image Input
imageInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      processInput("Analyze this image and the following context: " + messyInput.value, base64);
    };
    reader.readAsDataURL(file);
  }
});
