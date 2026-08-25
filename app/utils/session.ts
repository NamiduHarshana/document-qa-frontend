export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('doc_qa_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('doc_qa_session_id', sessionId);
  }

  return sessionId;
}

const CLEAR_SESSION_URL = 'https://namidu.pythonanywhere.com/api/documents/clear-session/';

export function clearSessionDocuments(): void {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
  navigator.sendBeacon(CLEAR_SESSION_URL, new URLSearchParams({ session_id: getSessionId() }));
}
