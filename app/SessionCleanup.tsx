'use client';

import { useEffect } from 'react';
import { clearSessionDocuments } from './utils/session';

export default function SessionCleanup() {
  useEffect(() => {
    const handlePageHide = () => clearSessionDocuments();
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  return null;
}
