# Document Q&A Assistant — Frontend

A Next.js frontend for an AI-powered document Q&A application. Upload PDF/DOCX files and ask natural-language questions grounded in their content, with a polished dark-themed, mobile-responsive interface.

**Live app:** https://document-qa-assistant.netlify.app
**Backend repo:** https://github.com/NamiduHarshana/document-qa-project

## Features

- Drag-and-drop document upload with live status feedback
- Document-scoped AI chat — ask questions about one specific document or all of them
- Dark, distinctive UI theme (no default component-library look)
- Fully responsive — collapsible drawer sidebar on mobile, card-based document list
- Session-based privacy — no login required; data is scoped per-browser-session and cleared automatically on tab close

## Tech Stack

- Next.js 16 (App Router), React, TypeScript
- Tailwind CSS
- lucide-react icons

## Local Setup

git clone https://github.com/NamiduHarshana/document-qa-frontend.git
cd document-qa-frontend
npm install
npm run dev

Runs at http://localhost:3000. Update the API_URL/CHAT_URL constants in app/page.tsx and app/chat/page.tsx if pointing at a different backend.

## Deployment

Deployed on Netlify with automatic deploys from the main branch.
