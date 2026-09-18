'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentTab: 'home' | 'history' | 'settings';
  onSelectTab: (tab: 'home' | 'history' | 'settings') => void;
  isDemoMode: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isDemoMode,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full h-[44px] apple-frosted transition-colors">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('home')}
          className="text-[15px] font-semibold tracking-[-0.015em] text-apple-ink dark:text-white hover:opacity-80 transition-opacity apple-action"
        >
          Rehearse
        </button>

        {/* Apple Nav Link Row with Sliding Indicator */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {(['home', 'history', 'settings'] as const).map((tab) => {
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`relative px-2.5 sm:px-3 py-1 rounded-full text-[13px] tracking-[-0.01em] transition-colors apple-action capitalize ${
                  isActive
                    ? 'text-apple-ink dark:text-white font-medium'
                    : 'text-apple-inkMuted hover:text-apple-ink dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="header-active-pill"
                    className="absolute inset-0 bg-black/[0.05] dark:bg-white/[0.09] rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Right Utility: Theme Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-opacity apple-action p-1"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
