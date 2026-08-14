'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 transition-colors flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700"
        aria-label="Toggle Theme Menu"
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : theme === 'light' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Laptop className="w-5 h-5" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 ${
              theme === 'light' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          
          <button
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 ${
              theme === 'dark' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
          
          <button
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 ${
              theme === 'system' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
            }`}
          >
            <Laptop className="w-4 h-4" />
            System
          </button>
        </div>
      )}
    </div>
  );
}