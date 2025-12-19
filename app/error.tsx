'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 bg-red-900 text-white rounded-md font-medium hover:bg-red-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
