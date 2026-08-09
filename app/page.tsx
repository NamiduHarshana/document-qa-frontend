'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Upload, Cloud, Eye, Trash2, MessageSquare, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const API_URL = 'https://namidu.pythonanywhere.com/api/documents/';

interface Document {
  id: number;
  title: string;
  file: string;
  uploaded_at: string;
  extracted_text: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDocuments(data);
    } catch {
      // silently fail — list stays empty, upload panel still usable
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async () => {
    if (!title || !file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      setStatus('success');
      setTitle('');
      setFile(null);
      fetchDocuments();
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchDocuments();
    } catch {
      // leave list as-is if delete fails
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const fileType = (filename: string) => filename.split('.').pop()?.toUpperCase() ?? 'FILE';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

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
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">
            <FileText className="w-4 h-4" />
            Documents
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 text-sm">
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
            <h1 className="text-2xl font-bold text-slate-900">Document Q&A Assistant</h1>
            <p className="text-sm text-slate-500 mt-0.5">Upload your documents and get answers from your content.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-9 pr-4 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
            <Link href="/chat" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
              Chat with Documents
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Upload + status row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Upload New Document</h2>
              </div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
              />

              <label className="block text-sm font-medium text-slate-700 mb-1.5">Choose File</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <Cloud className="w-7 h-7 text-blue-500 mb-3" />
                <p className="font-medium text-slate-700 text-sm mb-1">
                  {file ? file.name : 'Drag & drop your file here'}
                </p>
                {!file && <p className="text-xs text-slate-400 mb-3">or</p>}
                <label className="cursor-pointer border border-slate-300 bg-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-slate-50">
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="text-xs text-slate-400 mt-3">Supported formats: PDF, DOCX (Max 20MB)</p>
              </div>

              <button
                onClick={handleUpload}
                disabled={!title || !file || status === 'uploading'}
                className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>

            {/* Status panel */}
            <div className="space-y-3">
              {status === 'uploading' && (
                <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Uploading...</p>
                    <p className="text-sm text-blue-600">Please wait while your document is being uploaded.</p>
                  </div>
                </div>
              )}
              {status === 'success' && (
                <div className="flex gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Success!</p>
                    <p className="text-sm text-green-600">Document uploaded successfully.</p>
                  </div>
                </div>
              )}
              {status === 'error' && (
                <div className="flex gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error!</p>
                    <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                  </div>
                </div>
              )}
              {status === 'idle' && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-400">
                  Upload status will appear here.
                </div>
              )}
            </div>
          </div>

          {/* Documents table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Your Documents</h2>
            </div>

            {documents.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">
                No documents yet — upload your first one above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="font-medium py-3 px-6">Title</th>
                    <th className="font-medium py-3 px-4">Upload Date</th>
                    <th className="font-medium py-3 px-4">Type</th>
                    <th className="font-medium py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {fileType(doc.file)}
                          </span>
                          <span className="font-medium text-slate-800">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(doc.uploaded_at)} <span className="text-slate-300">·</span> {formatTime(doc.uploaded_at)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{fileType(doc.file)}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 border border-blue-200 hover:bg-blue-50 text-xs font-medium px-3 py-1.5 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="flex items-center gap-1.5 text-red-600 border border-red-200 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}