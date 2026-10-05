import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ChatContainer({
  messages = [],
  isLoading,
  error,
  onRetry,
  onSelectSuggestion,
  isDbConnected,
  onOpenConnectModal,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col justify-center">
        <EmptyState
          onSelectSuggestion={onSelectSuggestion}
          isDbConnected={isDbConnected}
          onOpenConnectModal={onOpenConnectModal}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-6 md:px-8 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {isLoading && <LoadingState />}

        {error && (
          <div className="my-4 sm:my-6 p-3.5 sm:p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-rose-200 mb-1 text-xs sm:text-sm">Analysis Error</h4>
                  <p className="leading-relaxed text-rose-300/90 break-words">{error}</p>
                  {error.toLowerCase().includes('database is not connected') && (
                    <button
                      onClick={onOpenConnectModal}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      type="button"
                    >
                      Connect Database Now
                    </button>
                  )}
                </div>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="self-end sm:self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors flex-shrink-0 text-xs"
                  type="button"
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
