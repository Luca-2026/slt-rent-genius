import { Component, type ErrorInfo, type ReactNode } from "react";
import { recoverFromChunkLoadError } from "@/lib/chunkLoadRecovery";

type ChunkLoadErrorBoundaryProps = {
  children: ReactNode;
};

type ChunkLoadErrorBoundaryState = {
  hasError: boolean;
};

export class ChunkLoadErrorBoundary extends Component<
  ChunkLoadErrorBoundaryProps,
  ChunkLoadErrorBoundaryState
> {
  state: ChunkLoadErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): ChunkLoadErrorBoundaryState | null {
    if (recoverFromChunkLoadError(error)) {
      return { hasError: true };
    }

    throw error;
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (!recoverFromChunkLoadError(error)) {
      console.error(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}