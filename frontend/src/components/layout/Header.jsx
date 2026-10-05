import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Menu, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({
  onToggleSidebar,
  currentTitle,
  isDbConnected,
  onOpenConnectModal,
  onRefreshConversations,
  isRefreshing,
}) {
  return (
    <header className="h-14 sm:h-16 flex-shrink-0 flex items-center justify-between px-3 sm:px-6 border-b border-slate-800 bg-surface-200/90 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Mobile Menu & Current Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          type="button"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-100 max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md truncate">
            {currentTitle || 'New Analysis'}
          </h2>
        </div>
      </div>

      {/* Right: Actions, Database Pill & Clerk User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Refresh Conversations History button */}
        <button
          onClick={onRefreshConversations}
          disabled={isRefreshing}
          className="p-1.5 sm:p-2 rounded-xl border border-slate-800 bg-surface-100 text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
          type="button"
          title="Refresh Conversation History"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-brand-400' : ''} />
        </button>

        {/* Database Status Button */}
        <button
          onClick={onOpenConnectModal}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isDbConnected
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
          type="button"
        >
          <Database size={13} className="flex-shrink-0" />
          <span className="hidden md:inline">Database:</span>
          <span className="flex items-center gap-1 text-[11px] sm:text-xs">
            {isDbConnected ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="hidden xs:inline">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} className="text-amber-400" />
                <span className="hidden xs:inline">Connect</span>
              </>
            )}
          </span>
        </button>

        {/* Clerk User Avatar Button in Header */}
        <div className="pl-1 flex items-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700 hover:border-brand-500 transition-colors',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
