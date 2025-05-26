import React from 'react';

/**
 * Error boundary component for PasteTable.
 * Only handles runtime errors, not validation errors.
 */
export class PasteTableErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PasteTable encountered a runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="paste-table paste-table--error">
          <div className="paste-table__error">
            <h3>Something went wrong with the table.</h3>
            <p>
              Please refresh the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
