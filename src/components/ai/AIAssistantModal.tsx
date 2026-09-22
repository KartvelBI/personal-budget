import React, { useState, useRef, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { AIMessage } from './aiTypes';
import { processAIQuery } from './aiEngine';
import { AIChatMessage } from './AIChatMessage';
import { AIPromptChips } from './AIPromptChips';
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Minus,
  Send,
  Trash2,
  Bot,
  MessageSquare,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const {
    transactions,
    projects,
    invoices,
    coagents,
    categories,
    leads,
    settings,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
  } = useBudget();

  // Assistant Window States
  const isAssistantOpen = isAIAssistantOpen;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Input & Messages
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const initialWelcome: AIMessage = {
    id: 'welcome-msg',
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Hello John! 👋 I am your **AI Financial Assistant**.\n\nI have direct access to your real-time transactions, client directory, project deliverables, and invoices. Ask me questions like:`,
    suggestions: [
      'What was my income last week?',
      'Who is my biggest client?',
      'What was my income this month?',
      'Show expense breakdown',
      'Summarize pending invoices',
      'Show CRM leads pipeline',
    ],
  };

  const [messages, setMessages] = useState<AIMessage[]>([initialWelcome]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAssistantOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isAssistantOpen, isMinimized, isThinking]);

  useEffect(() => {
    if (isAssistantOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isAssistantOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    // Context snapshot for the query
    const context = {
      transactions,
      projects,
      invoices,
      coagents,
      categories,
      leads,
      settings,
    };

    // Simulate realistic AI reasoning time
    setTimeout(() => {
      const response = processAIQuery(query, context);
      setMessages((prev) => [...prev, response]);
      setIsThinking(false);
    }, 450);
  };

  const handleClearHistory = () => {
    setMessages([initialWelcome]);
  };

  return (
    <>
      {/* Backdrop in expanded mode */}
      {isAssistantOpen && !isMinimized && isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-45 transition-opacity"
        />
      )}

      {/* 1. FLOATING ACTION BUTTON (TRIGGER) */}
      {!isAssistantOpen && (
        <button
          onClick={() => {
            setIsAIAssistantOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4.5 py-3 bg-[#4E53EE] hover:bg-[#4338CA] text-white rounded-2xl shadow-xl shadow-[#4E53EE]/35 transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Open AI Financial Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white"></span>
          </div>
          <span className="text-xs font-extrabold tracking-wide">AI Assistant</span>
        </button>
      )}

      {/* 2. MINIMIZED PILL (IF MINIMIZED) */}
      {isAssistantOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4.5 py-3 bg-[#1E2238] dark:bg-[#161922] text-white border border-[#4E53EE]/40 rounded-2xl shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#4E53EE] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-extrabold">AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
          </button>
        </div>
      )}

      {/* 3. MAIN CHAT WINDOW (COMPACT OR EXPANDED MODAL) */}
      {isAssistantOpen && !isMinimized && (
        <div
          className={
            isExpanded
              ? 'fixed inset-4 sm:inset-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-8 lg:bottom-8 w-full lg:w-[860px] max-h-[92vh] z-50 flex flex-col bg-white dark:bg-[#12151E] rounded-3xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl overflow-hidden transition-all duration-300'
              : 'fixed bottom-6 right-4 sm:right-6 w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[86vh] z-50 flex flex-col bg-white dark:bg-[#12151E] rounded-3xl border border-[#F0F2F7] dark:border-[#232738] shadow-2xl overflow-hidden transition-all duration-300'
          }
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border-b border-[#F0F2F7] dark:border-[#232738] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4E53EE] to-[#818cf8] text-white flex items-center justify-center shadow-md shadow-[#4E53EE]/20 shrink-0">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-[#1E2238] dark:text-white">
                    Financial AI Copilot
                  </h3>
                  <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded-md font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-[#8C93AB] dark:text-[#7A839E]">
                  Real-time financial analytics & charts
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              {/* Clear messages */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-[#8C93AB] hover:text-[#EF4444] rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Expand / Shrink */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
                title={isExpanded ? 'Restore compact window' : 'Expand window'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Minimize to corner */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsAIAssistantOpen(false)}
                className="p-1.5 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 bg-[#F8F9FC]/40 dark:bg-[#0F111A]/40">
            {messages.map((msg, index) => (
              <AIChatMessage
                key={msg.id || index}
                message={msg}
                isExpanded={isExpanded}
                onSelectPrompt={(p) => handleSendMessage(p)}
                isLatestAssistant={
                  msg.sender === 'assistant' && index === messages.length - 1
                }
              />
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex justify-start gap-2.5 items-center my-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4E53EE] to-[#818cf8] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4E53EE]/20">
                  <Sparkles className="w-4.5 h-4.5 stroke-[2.4] animate-spin" />
                </div>
                <div className="bg-white dark:bg-[#161922] border border-[#F0F2F7] dark:border-[#232738] px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs text-xs font-semibold text-[#8C93AB] flex items-center gap-2">
                  <span>Analyzing ledger & generating charts</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4E53EE] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4E53EE] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4E53EE] animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-[#161922] border-t border-[#F0F2F7] dark:border-[#232738] shrink-0 space-y-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask e.g. What was my income last week? or Who is biggest client?..."
                  disabled={isThinking}
                  className="w-full pl-4 pr-10 py-3 text-xs bg-[#F8F9FC] dark:bg-[#1F2330] border border-[#E5E7EB] dark:border-[#2A3044] rounded-2xl outline-none focus:ring-2 focus:ring-[#4E53EE]/20 focus:border-[#4E53EE] text-[#1E2238] dark:text-white placeholder-[#8C93AB] font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="w-11 h-11 rounded-2xl bg-[#4E53EE] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-md shadow-[#4E53EE]/25 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                title="Send query"
              >
                <Send className="w-4.5 h-4.5 stroke-[2.4]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
