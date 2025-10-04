import { useState, useEffect } from 'react'
import { Landing } from './components/Landing'
import { VideoChat } from './components/VideoChat'
import { Profile } from './components/Profile'
import { ThemeProvider } from './contexts/ThemeContext'
import { User } from './types'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'profile'>('landing')
  const [roomId, setRoomId] = useState<string>('')
  
  // Mock user data - in a real app this would come from authentication
  const [user, setUser] = useState<User>({
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: '2024-10-15T14:30:00Z'
  })

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

  const handleShowProfile = () => {
    setCurrentView('profile')
  }

  const handleBackFromProfile = () => {
    setCurrentView('landing')
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  if (currentView === 'landing') {
    return (
      <ThemeProvider>
        <Landing onStartCall={handleStartCall} onShowProfile={handleShowProfile} />
      </ThemeProvider>
    )
  }

  if (currentView === 'profile') {
    return (
      <ThemeProvider>
        <Profile user={user} onBack={handleBackFromProfile} onUpdateUser={handleUpdateUser} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <VideoChat roomId={roomId} onBackToLanding={handleBackToLanding} onShowProfile={handleShowProfile} />
    </ThemeProvider>
  )
}

export default App
