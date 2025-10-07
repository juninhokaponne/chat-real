import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

import AuthCards from './auth/AuthCards'
import { useAuth } from './auth/authContext'
import { AuthProvider } from './auth/AuthProvider'
import { Sessions } from './auth/Sessions'
import { Landing } from './components/Landing'
import ShareRoom from './components/ShareRoom'
import { VideoChat } from './components/VideoChat'
import './App.css'

function InnerApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing')
  const [roomId, setRoomId] = useState<string>('')
  const { user, logout } = useAuth();

  // Verifica se já tem um room ID na URL ao carregar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomFromUrl = urlParams.get('room')
    
    if (roomFromUrl) {
      setRoomId(roomFromUrl)
      setCurrentView('chat')
    }
  }, [])

  const handleStartCall = (newRoomId?: string) => {
    const finalRoomId = newRoomId || roomId
    setRoomId(finalRoomId)
    
    // Atualiza a URL sem recarregar
    const newUrl = `${window.location.pathname}?room=${finalRoomId}`
    window.history.pushState({}, '', newUrl)
    
    setCurrentView('chat')
    // show share panel so user can copy the room link immediately
    setShowShare(true);
  }

  const [showShare, setShowShare] = useState(false);

  const handleBackToLanding = () => {
    setCurrentView('landing')
    setRoomId('')
    
    // Remove room da URL
    window.history.pushState({}, '', window.location.pathname)
  }

  const [showSessions, setShowSessions] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  if (currentView === 'landing') {
    return (
      <Routes>
        <Route path="/" element={<div>
          <Landing onStartCall={handleStartCall} onOpenAuth={() => setShowAuth(true)} isAuthenticated={!!user} onLogout={logout} />
          {showSessions && <div style={{ position: 'fixed', right: 16, top: 56 }}><Sessions userId={user?.userId} onClose={() => setShowSessions(false)} /></div>}
          {showAuth && <AuthCards onClose={() => setShowAuth(false)} />}
          {showShare && roomId && <ShareRoom roomId={roomId} onClose={() => setShowShare(false)} />}
        </div>} />
        <Route path="/signin" element={<div>
          <Landing onStartCall={handleStartCall} onOpenAuth={() => setShowAuth(true)} isAuthenticated={!!user} onLogout={logout} />
          <AuthCards pushUrl onClose={() => navigate(-1)} />
        </div>} />
        <Route path="/signup" element={<div>
          <Landing onStartCall={handleStartCall} onOpenAuth={() => setShowAuth(true)} isAuthenticated={!!user} onLogout={logout} />
          <AuthCards pushUrl onClose={() => navigate(-1)} />
        </div>} />
      </Routes>
    )
  }
  return <VideoChat roomId={roomId} onBackToLanding={handleBackToLanding} />
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
