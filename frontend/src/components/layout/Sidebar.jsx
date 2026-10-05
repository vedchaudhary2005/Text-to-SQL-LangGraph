import React, { useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import {
  Plus,
  MessageSquare,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Server,
  Layers,
  User,
} from 'lucide-react';

export default function Sidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewAnalysis,
  isDbConnected,
  dbConfig,
  onOpenConnectModal,
  isOpen,
  onClose,
  backendOnline,
}) {
  const { user } = useUser();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex-shrink-0 flex flex-col bg-surface-200 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20 flex-shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                AI Data Analyst
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                <span className="truncate">LangGraph SQL Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action: New Analysis */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewAnalysis();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
            type="button"
          >
            <Plus size={16} />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Recent Analysis
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No previous analyses found.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.conversation_id === activeConversationId;
              const title =
                conv.title ||
                (conv.messages && conv.messages[0] && conv.messages[0].content) ||
                'Untitled Analysis';

              return (
                <button
                  key={conv.conversation_id}
                  onClick={() => {
                    onSelectConversation(conv.conversation_id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:bg-surface-100 hover:text-slate-200'
                  }`}
                  type="button"
                >
                  <MessageSquare
                    size={14}
                    className={
                      isActive
                        ? 'text-brand-400 flex-shrink-0'
                        : 'text-slate-500 flex-shrink-0'
                    }
                  />
                  <span className="truncate">{title}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Database Status & User Profile (Bottom) */}
        <div className="p-3 border-t border-slate-800 bg-surface-300/50 space-y-2">
          {/* Backend Status */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-100 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Server size={13} className={backendOnline ? 'text-emerald-400' : 'text-rose-400'} />
              <span className="text-slate-300 text-[11px]">Backend API</span>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                backendOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {backendOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Database Connection Card */}
          <div className="p-2.5 rounded-xl border border-slate-800 bg-surface-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={13} className={isDbConnected ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="font-medium text-slate-200 text-xs">MySQL DB</span>
              </div>
              <span
                className={`flex items-center gap-1 text-[10px] font-medium ${
                  isDbConnected ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isDbConnected ? (
                  <>
                    <CheckCircle2 size={11} /> Connected
                  </>
                ) : (
                  <>
                    <AlertCircle size={11} /> Disconnected
                  </>
                )}
              </span>
            </div>

            {isDbConnected && dbConfig ? (
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {dbConfig.username}@{dbConfig.host}:{dbConfig.port}/{dbConfig.database}
              </div>
            ) : null}

            <button
              onClick={() => {
                onOpenConnectModal();
                if (onClose) onClose();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium"
              type="button"
            >
              {isDbConnected ? 'Change Database' : 'Connect Database'}
            </button>
          </div>

          {/* Authenticated User Profile */}
          {user && (
            <div className="pt-1 flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-7 h-7 rounded-full border border-slate-700',
                    },
                  }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-white text-xs truncate">
                    {user.fullName || user.username || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.primaryEmailAddress?.emailAddress || ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
