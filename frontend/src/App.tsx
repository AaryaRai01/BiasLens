import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UploadView from './components/UploadView'
import ReportView from './components/ReportView'

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'report'>('upload')
  const [auditData, setAuditData] = useState<any>(null)

  const handleUploadComplete = (data: any) => {
    setAuditData(data)
    setCurrentView('report')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 z-10">
          <div className="max-w-6xl mx-auto h-full">
            {currentView === 'upload' ? (
              <UploadView onComplete={handleUploadComplete} />
            ) : (
              <ReportView data={auditData} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
