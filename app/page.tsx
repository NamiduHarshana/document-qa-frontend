'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Upload, Cloud, Eye, Trash2, MessageSquare, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getSessionId } from './utils/session';
import AppShell from './components/AppShell';

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
  const [titleError, setTitleError] = useState('');
  const [fileError, setFileError] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { 'X-Session-Id': getSessionId() },
      });
      const data = await res.json();
      setDocuments(data);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async () => {
    setTitleError(title ? '' : 'Please enter a title');
    setFileError(file ? '' : 'Please choose a file');
    if (!title || !file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'X-Session-Id': getSessionId() },
        body: formData,
      });
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
      await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: { 'X-Session-Id': getSessionId() },
      });
      fetchDocuments();
    } catch {
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
    <AppShell active="documents">
      <header className="bg-stone-900 border-b border-stone-800 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-stone-50">Document Q&A Assistant</h1>
          <p className="text-sm text-stone-400 mt-0.5">Upload your documents and get answers from your content.</p>
        </div>
        <Link href="/chat" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-sm font-semibold px-4 py-2 rounded-lg min-h-11 transition-colors shrink-0">
          <MessageSquare className="w-4 h-4" />
          Chat with Documents
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-stone-900 rounded-2xl border border-stone-800 shadow-sm shadow-black/20 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Cloud className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-stone-50">Upload New Document</h2>
            </div>

            <label className="block text-sm font-medium text-stone-300 mb-1.5">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
              placeholder="Enter document title..."
              className={`w-full px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 bg-stone-800 rounded-lg border min-h-11 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                titleError ? 'border-red-500/60' : 'border-stone-700'
              }`}
            />
            {titleError && <p className="text-xs text-red-400 mt-1.5">{titleError}</p>}

            <label className="block text-sm font-medium text-stone-300 mb-1.5 mt-5">Choose File</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { handleDrop(e); if (fileError) setFileError(''); }}
              className={`border-2 border-dashed rounded-xl py-8 md:py-10 px-4 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? 'border-amber-500 bg-amber-500/10' : fileError ? 'border-red-500/60 bg-red-500/5' : 'border-stone-700 bg-stone-800/50'
              }`}
            >
              <Cloud className="w-7 h-7 text-amber-500 mb-3" />
              <p className="font-medium text-stone-200 text-sm mb-1">
                {file ? file.name : 'Drag & drop your file here'}
              </p>
              {!file && <p className="text-xs text-stone-500 mb-3">or</p>}
              <label className="cursor-pointer inline-flex items-center border border-stone-700 bg-stone-900 text-stone-200 text-sm font-medium px-4 py-2 rounded-lg min-h-11 hover:bg-stone-800 transition-colors">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); if (fileError) setFileError(''); }}
                />
              </label>
              <p className="text-xs text-stone-500 mt-3">Supported formats: PDF, DOCX (Max 20MB)</p>
            </div>
            {fileError && <p className="text-xs text-red-400 mt-1.5">{fileError}</p>}

            <button
              onClick={handleUpload}
              disabled={status === 'uploading'}
              className="mt-5 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-sm font-semibold px-4 py-2.5 rounded-lg min-h-11 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          <div className="space-y-3">
            {status === 'uploading' && (
              <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Uploading...</p>
                  <p className="text-sm text-amber-200">Please wait while your document is being uploaded.</p>
                </div>
              </div>
            )}
            {status === 'success' && (
              <div className="flex gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Success!</p>
                  <p className="text-sm text-emerald-200">Document uploaded successfully.</p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="flex gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-300">Error!</p>
                  <p className="text-sm text-red-200">Something went wrong. Please try again.</p>
                </div>
              </div>
            )}
            {status === 'idle' && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-sm text-stone-500">
                Upload status will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-sm shadow-black/20 overflow-hidden">
          <div className="flex items-center gap-2 px-4 md:px-6 py-4 border-b border-stone-800">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-stone-50">Your Documents</h2>
          </div>

          {documents.length === 0 ? (
            <div className="py-14 px-4 text-center text-sm text-stone-500">
              No documents yet, upload your first one above.
            </div>
          ) : (
            <>
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-500 border-b border-stone-800">
                    <th className="font-medium py-3 px-6">Title</th>
                    <th className="font-medium py-3 px-4">Upload Date</th>
                    <th className="font-medium py-3 px-4">Type</th>
                    <th className="font-medium py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-stone-800/60 last:border-0 hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {fileType(doc.file)}
                          </span>
                          <span className="font-medium text-stone-100">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {formatDate(doc.uploaded_at)} <span className="text-stone-600">.</span> {formatTime(doc.uploaded_at)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">{fileType(doc.file)}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="flex items-center gap-1.5 text-red-400 border border-red-500/30 hover:bg-red-500/10 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
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

              <div className="md:hidden divide-y divide-stone-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {fileType(doc.file)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-100 truncate">{doc.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {formatDate(doc.uploaded_at)} <span className="text-stone-600">.</span> {formatTime(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 text-sm font-medium px-3 rounded-lg min-h-11 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-red-400 border border-red-500/30 hover:bg-red-500/10 text-sm font-medium px-3 rounded-lg min-h-11 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
