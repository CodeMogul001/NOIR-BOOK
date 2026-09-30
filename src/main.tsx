import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // If the error is an extension collision (such as isZerion), suppress error screen
    if (error?.message && (error.message.includes('isZerion') || error.message.includes('Cannot redefine property'))) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error?.message && (error.message.includes('isZerion') || error.message.includes('Cannot redefine property'))) {
      return;
    }
    console.error('NoirBook caught application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 bg-[#ffffff] rounded-3xl shadow-xl border border-[#d0c4be]/40 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">spa</span>
            </div>
            <h2 className="font-serif text-[24px] text-[#000000]">Mae Noir Atelier</h2>
            <p className="font-sans text-[14px] text-[#4d4541]">
              A temporary interface issue occurred. Please refresh the page to return to your bespoke booking experience.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#000000] text-[#ffffff] font-sans text-xs font-semibold uppercase tracking-wider hover:bg-[#4d4541] transition-colors"
            >
              Reload Atelier
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

