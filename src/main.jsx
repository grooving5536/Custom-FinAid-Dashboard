import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#fff', fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
          <h1>Something went wrong</h1>
          <p style={{ marginTop: 10, marginBottom: 10 }}>Error: {this.state.error?.message || 'Unknown error'}</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 5, overflow: 'auto', fontSize: '12px' }}>
            {this.state.error?.stack || 'No stack trace available'}
          </pre>
          <p style={{ marginTop: 10 }}>Check the browser console (F12 → Console) for more details.</p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
