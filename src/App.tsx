import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'

// Pages
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import TutorBuilder from './pages/TutorBuilder'
import ChatInterface from './pages/ChatInterface'
import Library from './pages/Library'

// Components
import Navigation from './components/layout/Navigation'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<TutorBuilder />} />
            <Route path="/chat/:tutorId" element={<ChatInterface />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App