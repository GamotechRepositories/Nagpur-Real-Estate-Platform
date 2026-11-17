import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AgentPortal ErrorBoundary caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('agent_token');
      localStorage.removeItem('agent_user');
      localStorage.removeItem('agent_profile');
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Workspace Encountered an Issue</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              A temporary issue occurred while loading this view. You can reload the page or reset your portal session.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left overflow-auto max-h-24">
                <p className="text-[11px] font-mono text-rose-700 break-words">
                  {String(this.state.error.message || this.state.error)}
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                <LogOut size={14} />
                <span>Reset to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

