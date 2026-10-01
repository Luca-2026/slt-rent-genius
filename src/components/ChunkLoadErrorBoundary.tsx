import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  isRecoverableChunkLoadError,
  recoverFromChunkLoadError,
} from "@/lib/chunkLoadRecovery";

type ChunkLoadErrorBoundaryProps = {
  children: ReactNode;
};

type ChunkLoadErrorBoundaryState = {
  hasError: boolean;
  reloading: boolean;
};

export class ChunkLoadErrorBoundary extends Component<
  ChunkLoadErrorBoundaryProps,
  ChunkLoadErrorBoundaryState
> {
  state: ChunkLoadErrorBoundaryState = { hasError: false, reloading: false };

  static getDerivedStateFromError(error: unknown): ChunkLoadErrorBoundaryState | null {
    if (!isRecoverableChunkLoadError(error)) {
      throw error;
    }

    // Automatischer Reload (einmal pro 15 s). Schlägt er erneut fehl, zeigen wir
    // eine manuelle Wiederholen-Schaltfläche statt eines leeren Bildschirms.
    return { hasError: true, reloading: recoverFromChunkLoadError(error) };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (!isRecoverableChunkLoadError(error)) {
      console.error(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.reloading) return null;

      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground"
        >
          <p className="text-lg font-semibold">Die Seite konnte nicht vollständig geladen werden.</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Vermutlich liegt eine ältere Version im Zwischenspeicher. Bitte lade die Seite neu.
          </p>
          <button
            type="button"
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
