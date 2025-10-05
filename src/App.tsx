import { useState, useEffect } from 'react'

import { Landing } from './components/Landing'
import { VideoChat } from './components/VideoChat'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing')
  const [roomId, setRoomId] = useState<string>('')

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
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
    setRoomId('')
    
    // Remove room da URL
    window.history.pushState({}, '', window.location.pathname)
  }

  if (currentView === 'landing') {
    return <Landing onStartCall={handleStartCall} />
  }

  return <VideoChat roomId={roomId} onBackToLanding={handleBackToLanding} />
}

export default App
