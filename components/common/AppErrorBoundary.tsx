// components/common/AppErrorBoundary.tsx
"use client";

import React from "react";
import AppErrorFallback from "./AppErrorFallback";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void; // NEW
}

export default class AppErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AppErrorBoundary caught:", error, info);

    // Trigger toast or external logging
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <AppErrorFallback error={this.state.error} reset={this.reset} />
        )
      );
    }

    return this.props.children;
  }
}
