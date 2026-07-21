import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@resume/ui";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center p-6">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h1 className="font-display text-2xl">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">{this.state.error.message}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => this.setState({ error: null })}>Try again</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
