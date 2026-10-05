import React, { useRef, useEffect } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  disabled,
  placeholder = 'Ask anything about your business data...',
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4 pt-1 sm:pt-2 flex-shrink-0">
      <div className="relative rounded-2xl border border-slate-800 bg-surface-100/95 shadow-xl focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="w-full resize-none bg-transparent py-3 sm:py-3.5 pl-3 sm:pl-4 pr-12 sm:pr-14 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50 font-sans"
        />

        <div className="absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 flex items-center gap-1.5">
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading || disabled}
            className="flex h-8 w-8 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all"
            type="button"
            title="Send query"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-between mt-1.5 px-2 text-[11px] text-slate-500">
        <span>AI Data Analyst with LangGraph Text-to-SQL</span>
        <span className="flex items-center gap-1">
          <CornerDownLeft size={10} /> Enter to send, Shift + Enter for newline
        </span>
      </div>
    </div>
  );
}
