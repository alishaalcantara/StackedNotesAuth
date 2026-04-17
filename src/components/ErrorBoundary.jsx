import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[StackNotes]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#444',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1.5rem', color: '#777' }}>
            An unexpected error occurred on this page.
          </p>
          <Link
            to="/"
            style={{
              background: '#467B81',
              color: '#fff',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Go Home
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
