import React from 'react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Log to analytics if available
    if (window.gtag) {
      window.gtag('event', 'error', {
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Reload the page or reset app state
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.href = '/'
    }
  }

  handleReport = () => {
    // Send error report to server
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error)
    
    alert('Error reported. Thank you for helping us improve!')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#1E1010] border border-[#FF8A8A]/30 rounded-2xl p-8 text-center"
          >
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h1 className="text-2xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
              Something Went Wrong
            </h1>
            
            <p className="text-[#B8967A]/80 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-lg text-[#0C0505] font-bold transition-all hover:opacity-90"
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={this.handleReport}
                className="w-full py-3 bg-[#2A1A0A] border border-[#F5B800]/20 rounded-lg text-[#F5B800] font-medium transition-all hover:border-[#F5B800]/50"
              >
                📧 Report Issue
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 bg-transparent border border-[#F5B800]/15 rounded-lg text-[#B8967A] transition-all hover:border-[#F5B800]/30"
              >
                🏠 Go Home
              </button>
            </div>
            
            {/* Error Details (expandable for debugging) */}
            {this.props.showDetails && (
              <div className="mt-6">
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-xs text-[#B8967A]/60 hover:text-[#F5B800]"
                >
                  {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                
                {this.state.showDetails && (
                  <pre className="mt-3 p-3 bg-[#0C0505] rounded-lg text-xs text-red-400 overflow-auto max-h-48">
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrap your App with ErrorBoundary
export const withErrorBoundary = (Component, options = {}) => {
  return (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  )
}

export default ErrorBoundary