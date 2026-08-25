'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Send, Loader2, Bot, User } from 'lucide-react';
import { getSessionId } from '../utils/session';
import AppShell from '../components/AppShell';

const CHAT_URL = 'https://namidu.pythonanywhere.com/api/chat/';
const DOCUMENTS_URL = 'https://namidu.pythonanywhere.com/api/documents/';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Document {
  id: number;
  title: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! Ask me anything about your uploaded documents." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(DOCUMENTS_URL, {
          headers: { 'X-Session-Id': getSessionId() },
        });
        const data = await res.json();
        setDocuments(data);
      } catch {
      }
    };
    fetchDocuments();
  }, []);

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
        body: JSON.stringify(
          selectedDocId === 'all' ? { question } : { question, document_id: selectedDocId }
        ),
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
    <AppShell active="chat">
      {/* Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-stone-50">Chat with Documents</h1>
          <p className="text-sm text-stone-400 mt-0.5">Ask questions and get answers grounded in your uploaded content.</p>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 border border-stone-700 hover:bg-stone-800 text-stone-200 text-sm font-medium px-4 py-2 rounded-lg min-h-11 transition-colors shrink-0"
        >
          <FileText className="w-4 h-4" />
          My Documents
        </Link>
      </header>

      {/* Document selector */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 md:px-8 py-3 flex items-center gap-3 flex-wrap">
        <label htmlFor="doc-select" className="text-sm font-medium text-stone-300">
          Chat about:
        </label>
        <select
          id="doc-select"
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          className="text-sm text-stone-100 rounded-lg border border-stone-700 bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 px-3 py-2 min-h-11 flex-1 md:flex-none min-w-0"
        >
          <option value="all">All Documents</option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 text-stone-950" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3.5 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-stone-950 rounded-br-sm'
                    : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-sm shadow-sm shadow-black/20'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5 text-stone-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 md:gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-stone-950" />
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-bl-sm shadow-sm shadow-black/20 px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-sm text-stone-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar */}
      <div className="border-t border-stone-800 bg-stone-900 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="flex-1 resize-none px-3.5 md:px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 bg-stone-800 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 max-h-32 min-h-11"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-medium px-4 py-3 rounded-xl transition-colors shrink-0 min-h-11 min-w-11"
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}