import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function ThemeToggle({ darkMode, setDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm cursor-pointer hover:scale-105 transition-all duration-200"
      aria-label="Toggle Theme Mode"
    >
      {darkMode ? (
        <Sun className="h-5 w-5 animate-pulse-gentle" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
