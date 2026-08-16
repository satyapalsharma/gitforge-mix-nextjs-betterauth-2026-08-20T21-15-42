'use client';

import { useEffect } from 'react';
import { logger } from './logger';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle uncaught exceptions
    const handleUncaughtException = (event: ErrorEvent) => {
      logger.error('Uncaught exception:', event.error);
      // Optionally report to an error tracking service
      // reportErrorToService(event.error);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Error) {
        logger.error('Unhandled promise rejection:', reason);
      } else {
        logger.error('Unhandled promise rejection:', String(reason));
      }
      // Optionally report to an error tracking service
      // reportErrorToService(reason);
    };

    window.addEventListener('error', handleUncaughtException);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUncaughtException);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
