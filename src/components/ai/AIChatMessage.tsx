import React from 'react';
import { AIMessage } from './aiTypes';
import { AIVisualRenderer } from './AIVisualRenderer';
import { AIPromptChips } from './AIPromptChips';
import { Sparkles, User, Copy, Check } from 'lucide-react';

interface Props {
  message: AIMessage;
  isExpanded?: boolean;
  onSelectPrompt?: (prompt: string) => void;
  isLatestAssistant?: boolean;
}

export const AIChatMessage: React.FC<Props> = ({
  message,
  isExpanded = false,
  onSelectPrompt,
  isLatestAssistant = false,
}) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown: **bold**
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-[#1E2238] dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 items-end my-3">
        <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
          <div className="bg-[#4E53EE] text-white p-3.5 rounded-2xl rounded-br-xs text-xs font-medium shadow-sm leading-relaxed">
            {message.text}
          </div>
          <div className="text-[10px] text-[#8C93AB] text-right font-mono pr-1">
            {message.timestamp}
          </div>
        </div>
        <div className="w-7 h-7 rounded-xl bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#7378FF] flex items-center justify-center shrink-0 mb-4 shadow-2xs">
          <User className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5 items-start my-3.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4E53EE] to-[#818cf8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-[#4E53EE]/20">
        <Sparkles className="w-4.5 h-4.5 stroke-[2.4]" />
      </div>

      <div className="max-w-[92%] sm:max-w-[85%] space-y-2">
        <div className="bg-white dark:bg-[#161922] border border-[#F0F2F7] dark:border-[#232738] p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs text-[#5E6482] dark:text-[#949DB2] leading-relaxed transition-colors">
          {/* Header with bot title & copy button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F2F7] dark:border-[#232738]">
            <span className="text-[11px] font-bold text-[#4E53EE] dark:text-[#7378FF] flex items-center gap-1.5">
              <span>Financial Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8C93AB] font-mono">{message.timestamp}</span>
              <button
                onClick={handleCopy}
                className="p-1 text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white rounded-lg hover:bg-[#F8F9FC] dark:hover:bg-[#1F2330] transition cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Text Content with bold styling */}
          <div className="whitespace-pre-line text-xs font-normal">
            {renderFormattedText(message.text)}
          </div>

          {/* Embedded Recharts Visuals */}
          {message.visual && <AIVisualRenderer visual={message.visual} isExpanded={isExpanded} />}
        </div>

        {/* Prompt Suggestions if latest assistant message */}
        {isLatestAssistant && message.suggestions && onSelectPrompt && (
          <AIPromptChips
            suggestions={message.suggestions}
            onSelectPrompt={onSelectPrompt}
          />
        )}
      </div>
    </div>
  );
};
