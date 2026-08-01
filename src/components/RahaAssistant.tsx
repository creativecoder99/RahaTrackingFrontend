'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'What is Raha?', value: 'What is Raha?' },
  { label: 'How does routing work?', value: 'How does routing work?' },
  { label: 'How to get sandbox access?', value: 'How to get sandbox access?' },
  { label: 'What are the payout rates?', value: 'What are the payout rates?' },
  { label: 'What are the system roles?', value: 'What are the user roles?' },
  { label: 'How to log a session?', value: 'How to start and log a tracking session?' },
  { label: 'Can I export payroll reports?', value: 'Can I export reports?' },
  { label: 'Does it track live GPS?', value: 'Does it perform continuous live GPS tracking?' },
];

export const RahaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! 👋 I am the Raha Assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('what is') || q.includes('about') || q.includes('raha')) {
      return 'Raha is an automated mileage tracking and fuel reimbursement portal built for insurance sales teams. It bridges the gap between client visits and HR payroll systems by solving exact road distances.';
    }
    if (q.includes('routing') || q.includes('distance') || q.includes('map') || q.includes('work') || q.includes('osrm')) {
      return 'Raha records GPS checkpoints when a sales associate starts a session. When the day is closed, our OSRM (Open Source Routing Machine) road solver calculates the actual driving distance between stops, ensuring zero manual logging and precise verification.';
    }
    if (q.includes('sandbox') || q.includes('access') || q.includes('register') || q.includes('test') || q.includes('try')) {
      return 'You can test the platform by submitting your email in the "Request Sandbox Access" form on this landing page! Once registered, click the "Login" button at the top to access the mock dashboards.';
    }
    if (q.includes('payout') || q.includes('rate') || q.includes('fuel') || q.includes('cost') || q.includes('price')) {
      return 'Reimbursements accumulate at a standard rate of ₹12 per km driven. Branch heads review travel timelines on high-fidelity maps and export these logs as payroll CSVs.';
    }
    if (q.includes('role') || q.includes('manager') || q.includes('associate') || q.includes('branch head')) {
      return 'Raha defines two key roles:\n1. **Sales Associates**: Track travel session stops and request payouts.\n2. **Branch Heads**: Supervise team activity, review OSRM maps, and approve/reconcile payouts.';
    }
    if (q.includes('log') || q.includes('start') || q.includes('session') || q.includes('day') || q.includes('stop')) {
      return 'Log in as a Sales Associate, click "Start Day", and record "Lead Stops" with meeting notes at client locations. Finally, click "End Day" to trigger OSRM distance solver for road calculations.';
    }
    if (q.includes('export') || q.includes('csv') || q.includes('report') || q.includes('download') || q.includes('excel')) {
      return 'Yes! Branch Heads can select a calendar month and click "Export CSV" to download the fuel reimbursement ledger, containing structured associate travel distance records for accounting.';
    }
    if (q.includes('gps') || q.includes('live') || q.includes('continuous') || q.includes('privacy') || q.includes('battery')) {
      return 'No, Raha does not continuously track you in the background. It only records discrete location checkpoints when you click "Start Day", log "Lead Stops", or click "End Day", preserving privacy and device battery.';
    }
    if (q.includes('support') || q.includes('help') || q.includes('contact') || q.includes('email')) {
      return 'For any additional queries or assistance, please reach out to our team at support@raha.com.';
    }

    return "I'm the Raha static assistant. I can help with queries regarding: 'What is Raha?', 'routing/distance solver', 'sandbox access', 'payout rates', 'user roles', 'logging a session', 'exporting reports', or 'GPS privacy'. Try selecting a suggested prompt!";
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponseText = getBotResponse(text);
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
          aria-label="Open chat assistant"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm whitespace-nowrap">
            Chat with Raha
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-slate-950/95 backdrop-blur-lg border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center space-x-1.5">
                  <span>Raha Assistant</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800/40 hover:bg-slate-800 rounded-lg border border-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold ${
                    msg.sender === 'user'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="block text-[8px] text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-850 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick Action prompts */}
            {!isTyping && (
              <div className="pt-2 border-t border-slate-900 space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Suggested Questions</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => handleSendMessage(prompt.value)}
                      className="text-[11px] bg-slate-900 hover:bg-indigo-600/10 text-slate-300 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/30 rounded-xl px-3 py-1.5 text-left transition duration-150 cursor-pointer"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition duration-150"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition duration-150 cursor-pointer shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default RahaAssistant;
