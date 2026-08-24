'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Send, Loader2, Bot, User } from 'lucide-react';
import { getSessionId } from '../utils/session';

const CHAT_URL = 'https://namidu.pythonanywhere.com/api/chat/';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! Ask me anything about your uploaded documents." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const answer = data.answer ?? data.error ?? 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not reach the server. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">DocQ&A</p>
            <p className="text-xs text-slate-400 leading-tight">Assistant</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
            <FileText className="w-4 h-4" />
            Documents
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">
            <MessageSquare className="w-4 h-4" />
            Chat with Documents
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
            NH
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Namidu Harshana</p>
            <p className="text-xs text-slate-400 truncate">namidu@example.com</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chat with Documents</h1>
            <p className="text-sm text-slate-500 mt-0.5">Ask questions and get answers grounded in your uploaded content.</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <FileText className="w-4 h-4" />
            My Documents
          </Link>
        </header>

        {/* Chat area */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input bar */}
        <div className="border-t border-slate-200 bg-white px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 resize-none px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium px-4 py-3 rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}