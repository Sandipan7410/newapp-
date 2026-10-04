import React from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Sparkles,
  LogOut,
  HelpCircle,
  FolderOpen,
  Info,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  isSampleMode: boolean;
  onToggleSampleMode: (sample: boolean) => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticating: boolean;
  onOpenHelp: () => void;
  onOpenMockSheet: () => void;
  onOpenMockCalendar: () => void;
  mockSheetRowCount: number;
  mockCalendarEventCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSampleMode,
  onToggleSampleMode,
  currentUser,
  onSignIn,
  onSignOut,
  isAuthenticating,
  onOpenHelp,
  onOpenMockSheet,
  onOpenMockCalendar,
  mockSheetRowCount,
  mockCalendarEventCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  Meeting Decision Tracker
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI Generalist Portfolio
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Extract verified decisions & actions from Google Docs → Sync to Sheets & Calendar
              </p>
            </div>
          </div>

          {/* Right Navigation & Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* View Interactive Mocks in Sample Mode */}
            {isSampleMode && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={onOpenMockSheet}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
                  title="View simulated Google Sheet destination"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demo Sheet</span>
                  {mockSheetRowCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      {mockSheetRowCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={onOpenMockCalendar}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition border border-blue-200"
                  title="View simulated Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Calendar</span>
                  {mockCalendarEventCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {mockCalendarEventCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Mode Switcher Pill */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                type="button"
                onClick={() => onToggleSampleMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSampleMode
                    ? 'bg-white text-indigo-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sample Data Mode
              </button>
              <button
                type="button"
                onClick={() => onToggleSampleMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !isSampleMode
                    ? 'bg-white text-indigo-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Workspace Mode
              </button>
            </div>

            {/* Help / Recruiter Guide */}
            <button
              onClick={onOpenHelp}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Recruiter 3-minute evaluation guide & test scenarios"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Google Authentication Control */}
            {!isSampleMode && (
              <div className="flex items-center">
                {currentUser ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Google User'}
                        className="w-8 h-8 rounded-full border border-slate-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser.displayName || 'Connected User'}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onSignIn}
                    disabled={isAuthenticating}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-xs transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
