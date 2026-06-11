import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import UploadView from './components/UploadView'
import ExecutiveOverview from './components/ExecutiveOverview'
import PersonaStories from './components/PersonaStories'
import MitigationSandbox from './components/MitigationSandbox'
import DetailedAudit from './components/DetailedAudit'
import LoginPage from './components/LoginPage'
import { useAuth } from './AuthContext'
import './index.css'

export type View = 'upload' | 'executive' | 'persona' | 'mitigation' | 'audit'

function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>('upload')
  const [auditData, setAuditData] = useState<any>(null)
  const [auditKey, setAuditKey] = useState(0)
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null)

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type })
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleUploadComplete = (data: any) => {
    setAuditData(data)
    setAuditKey(k => k + 1)
    setCurrentView('executive')
    showNotification('Dataset processed successfully', 'success')
  }

  const handleNewAudit = () => {
    setAuditData(null)
    setCurrentView('upload')
  }

  const fairnessScore = auditData
    ? Math.round((1 - (auditData.demographicParity || 0.14)) * 100)
    : null

  // While Firebase resolves auth state, show a minimal dark loader
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#060a14'
      }}>
        <span className="login-spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  // Not signed in — show login page
  if (!user) {
    return <LoginPage />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1000,
          padding: '12px 20px',
          borderRadius: 10,
          backgroundColor: notification.type === 'success' ? '#059669' : notification.type === 'error' ? '#dc2626' : '#2563eb',
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeup 0.3s ease-out'
        }}>
          {notification.type === 'success' ? '✓' : notification.type === 'error' ? '!' : 'ℹ'} {notification.msg}
        </div>
      )}

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        hasData={!!auditData}
        onNewAudit={handleNewAudit}
        onNotify={showNotification}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar fairnessScore={fairnessScore} auditData={auditData} />
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-main)', padding: '28px 32px' }}>
          {currentView === 'upload' && (
            <UploadView onComplete={handleUploadComplete} />
          )}
          {currentView === 'executive' && auditData && (
            <ExecutiveOverview key={auditKey} data={auditData} setView={setCurrentView} onNotify={showNotification} />
          )}
          {currentView === 'persona' && auditData && (
            <PersonaStories key={auditKey} data={auditData} setView={setCurrentView} onNotify={showNotification} />
          )}
          {currentView === 'mitigation' && auditData && (
            <MitigationSandbox key={auditKey} data={auditData} setAuditData={setAuditData} onNotify={showNotification} />
          )}
          {currentView === 'audit' && auditData && (
            <DetailedAudit key={auditKey} data={auditData} onNotify={showNotification} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
