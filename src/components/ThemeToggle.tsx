import React from 'react';
import { Sparkles, Moon, Sun, Palette } from 'lucide-react';
import { useTheme, AppTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'full' | 'buttons';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, setTheme } = useTheme();

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-purple-900/50 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('purple')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            theme === 'purple'
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'text-zinc-400 hover:text-purple-300'
          }`}
          title="Purple Neon Theme"
        >
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          <span>Purple</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-zinc-800 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Dark AMOLED Mode"
        >
          <Moon className="w-3.5 h-3.5 text-zinc-300" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-zinc-900 shadow-[0_0_12px_rgba(0,0,0,0.1)] border border-zinc-200'
              : 'text-zinc-400 hover:text-amber-300'
          }`}
          title="Light Daylight Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-purple-400" />
          <span>App Appearance & Theme</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Purple */}
          <button
            type="button"
            onClick={() => setTheme('purple')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
              theme === 'purple'
                ? 'bg-purple-950/80 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/40'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-purple-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Purple Neon</div>
              <div className="text-[10px] text-purple-300/70">Studio Glow</div>
            </div>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-600 text-white shadow-lg ring-2 ring-zinc-500/40'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-3.5 h-3.5 rounded-full bg-zinc-700 border border-zinc-500" />
              <Moon className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Dark Mode</div>
              <div className="text-[10px] text-zinc-400">AMOLED Slate</div>
            </div>
          </button>

          {/* Light */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
              theme === 'light'
                ? 'bg-white border-amber-400 text-zinc-900 shadow-md ring-2 ring-amber-400/40'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-amber-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 group-[.theme-purple]:text-white">Light Mode</div>
              <div className="text-[10px] text-zinc-500">Daylight Clean</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Compact icon switch button
  return (
    <button
      type="button"
      onClick={() => {
        if (theme === 'purple') setTheme('dark');
        else if (theme === 'dark') setTheme('light');
        else setTheme('purple');
      }}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
        theme === 'purple'
          ? 'bg-purple-950/80 border-purple-500/50 text-fuchsia-300 hover:text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
          : theme === 'dark'
          ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
          : 'bg-amber-100 border-amber-300 text-amber-800 hover:text-amber-950'
      } ${className}`}
      title={`Current: ${theme.toUpperCase()} theme. Click to switch`}
    >
      {theme === 'purple' && <Sparkles className="w-4 h-4 text-fuchsia-400" />}
      {theme === 'dark' && <Moon className="w-4 h-4 text-zinc-200" />}
      {theme === 'light' && <Sun className="w-4 h-4 text-amber-600" />}
      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
        {theme}
      </span>
    </button>
  );
};
