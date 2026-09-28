"use client";

import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  HelpCircle,
  FileText,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useCivicStore } from '@/lib/useCivicStore';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    text: string;
    href: string;
  };
}

export default function CivicAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { complaints } = useCivicStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello! I am your CivicPulse AI Assistant. How can I help you today? You can report an issue, track a tracking ID (like CP-99840040), find nearby ward problems, or ask civic questions!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Voice speech-to-text integration
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Generate intelligent AI civic assistant response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';
      let actionLink: { text: string; href: string } | undefined;

      // 1. Tracking query (e.g. CP-99840040)
      const cpMatch = text.match(/CP-\d+/i);
      if (cpMatch) {
        const id = cpMatch[0].toUpperCase();
        const found = complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
        if (found) {
          reply = `Found complaint ${found.id}: "${found.title}". Current status is "${found.status}". Priority: ${found.priority}. Assigned to ${found.department}.`;
          actionLink = { text: `View Live Tracking for ${found.id}`, href: `/track?id=${found.id}` };
        } else {
          reply = `I searched for tracking ID ${id}, but couldn't find an exact match in our system. You can view all complaints or search again.`;
          actionLink = { text: 'Go to Tracking Page', href: '/track' };
        }
      }
      // 2. Report pothole / road
      else if (lower.includes('pothole') || lower.includes('road') || lower.includes('crater')) {
        reply = `I can help you report that road issue! I've activated our GPS location detector. Our AI Vision will automatically classify the severity, assign priority, and route it directly to the Roads & Infrastructure Department.`;
        actionLink = { text: 'Report Road Issue Now', href: '/report?cat=Pothole' };
      }
      // 3. Garbage / trash
      else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('dump')) {
        reply = `CivicPulse AI routes solid waste reports directly to the Sanitation Department with a 24-hour SLA. Uploading a photo helps calculate waste tonnage automatically.`;
        actionLink = { text: 'Report Waste Accumulation', href: '/report?cat=Garbage' };
      }
      // 4. Streetlight / light / dark
      else if (lower.includes('light') || lower.includes('dark') || lower.includes('electricity') || lower.includes('wire')) {
        reply = `Streetlight and electrical hazards are categorized under the Electrical Department. If there are live exposed wires, please mark it as an Emergency Complaint for immediate 4h escalation!`;
        actionLink = { text: 'Report Electrical Issue', href: '/report?cat=Broken%20streetlight' };
      }
      // 5. Water / drainage / sewage
      else if (lower.includes('water') || lower.includes('drain') || lower.includes('leak') || lower.includes('flood')) {
        reply = `Water supply leaks and stormwater drainage choke points receive high priority routing. We notify both the Drainage division and standby suction machine crews.`;
        actionLink = { text: 'Report Water / Drainage Issue', href: '/report?cat=Drainage' };
      }
      // 6. Nearby / map
      else if (lower.includes('near') || lower.includes('map') || lower.includes('hotspot')) {
        reply = `You can explore our interactive Civic Map to see real-time complaints, active field technicians, government project sites, and AI-identified civic hotspots in your ward.`;
        actionLink = { text: 'Open Interactive Civic Map', href: '/map' };
      }
      // 7. General help / greetings
      else {
        reply = `I am trained on city municipal protocols. You can report any civic issue (with automatic GPS detection), track complaints in real time, view transparent public funds, or inspect ward health scores. What would you like to do?`;
        actionLink = { text: 'Report a Civic Issue', href: '/report' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLink,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>CivicPulse AI Assistant</span>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>CivicPulse AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[11px] text-blue-100">Smart City Help & Issue Reporting</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-600 scrollbar-none">
            <button
              onClick={() => handleSend('There is a large pothole near my location')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 whitespace-nowrap transition"
            >
              🚧 Report Pothole
            </button>
            <button
              onClick={() => handleSend('Track CP-99840040')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 whitespace-nowrap transition"
            >
              🔍 Track CP-99840040
            </button>
            <button
              onClick={() => handleSend('What are civic hotspots in Ward 3?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 whitespace-nowrap transition"
            >
              📍 Ward Hotspots
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionLink && (
                    <Link
                      href={m.actionLink.href}
                      onClick={() => setIsOpen(false)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition text-[11px]"
                    >
                      <span>{m.actionLink.text}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about complaints, tracking ID, or report issue..."
                className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-400 transition"
              />

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
