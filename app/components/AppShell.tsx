'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Menu, X, User } from 'lucide-react';

interface AppShellProps {
  active: 'documents' | 'chat';
  children: React.ReactNode;
}

export default function AppShell({ active, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-amber-500/10 text-amber-400 font-medium'
        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
    }`;

  return (
    <div className="h-screen bg-stone-950 flex overflow-hidden">
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-stone-950" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-stone-50 leading-tight">DocQ&A</p>
              <p className="text-xs text-stone-500 leading-tight">Assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="md:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link href="/" onClick={() => setDrawerOpen(false)} className={navLinkClass(active === 'documents')}>
            <FileText className="w-4 h-4" />
            Documents
          </Link>
          <Link href="/chat" onClick={() => setDrawerOpen(false)} className={navLinkClass(active === 'chat')}>
            <MessageSquare className="w-4 h-4" />
            Chat with Documents
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-100 truncate">Guest User</p>
            <p className="text-xs text-stone-500 truncate">Anonymous session</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 h-14 px-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="w-11 h-11 -ml-2 flex items-center justify-center rounded-lg text-stone-300 hover:bg-stone-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-stone-950" />
            </div>
            <p className="font-semibold text-stone-50 text-sm">DocQ&A</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
