import { Component, type ReactNode, type ErrorInfo } from 'react';
import { TriangleAlert } from 'lucide-react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Rendering error', error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="flex min-h-dvh items-center justify-center bg-background p-6"><div role="alert" className="max-w-md rounded-2xl border border-border bg-white p-8"><TriangleAlert className="text-amber-600" /><h1 className="mt-4 text-xl font-semibold">Tampilan gagal dimuat</h1><p className="mt-2 text-sm text-muted">Terjadi kesalahan frontend. Tidak ada perangkat nyata yang terpengaruh.</p><button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm text-white">Muat ulang</button><p className="mt-4 text-xs text-muted">Prototype</p></div></main>;
    return this.props.children;
  }
}
