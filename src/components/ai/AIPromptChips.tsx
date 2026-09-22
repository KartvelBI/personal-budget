import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  suggestions: string[];
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const AIPromptChips: React.FC<Props> = ({ suggestions, onSelectPrompt, disabled }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {suggestions.map((prompt, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelectPrompt(prompt)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FC] dark:bg-[#1F2330] hover:bg-[#EDEEFD] dark:hover:bg-[#4E53EE]/20 text-[#5E6482] dark:text-[#949DB2] hover:text-[#4E53EE] dark:hover:text-[#7378FF] border border-[#F0F2F7] dark:border-[#2A3044] text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-3 h-3 text-[#4E53EE] dark:text-[#7378FF] shrink-0" />
          <span>{prompt}</span>
        </button>
      ))}
    </div>
  );
};
