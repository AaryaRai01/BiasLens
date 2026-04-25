import type { View } from '../App'

type SidebarProps = {
  currentView: View
  setCurrentView: (v: View) => void
  hasData: boolean
  onNewAudit: () => void
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

const navItems = [
  {
    id: 'executive' as View,
    label: 'Executive Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  {
    id: 'persona' as View,
    label: 'Persona Stories',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    id: 'mitigation' as View,
    label: 'Mitigation Sandbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )
  },
  {
    id: 'audit' as View,
    label: 'Detailed Audit',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 12h6M9 15h4"/>
      </svg>
    )
  },
]

export default function Sidebar({ currentView, setCurrentView, hasData, onNewAudit, onNotify }: SidebarProps) {
  return (
    <div style={{
      width: 200,
      minWidth: 200,
      backgroundColor: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      borderRight: '1px solid #1d2432',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, backgroundColor: 'var(--accent-blue)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontWeight: 900, fontSize: 16, boxShadow: '0 4px 12px rgba(59, 91, 219, 0.3)'
          }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2.5"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
              <path d="M6 16H11M21 16H26M16 6V11M16 21V26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            BiasLens
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          AI Fairness Auditor
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {navItems.map(item => {
          const isActive = currentView === item.id
          const isDisabled = !hasData

          return (
            <button
              key={item.id}
              onClick={() => hasData && setCurrentView(item.id)}
              disabled={isDisabled}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: isActive ? '#1d2432' : 'transparent',
                color: isActive ? '#ffffff' : isDisabled ? '#3d4554' : '#9ca3af',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: isDisabled ? 'default' : 'pointer',
                marginBottom: 2,
                textAlign: 'left',
                transition: 'all 0.15s',
                borderLeft: isActive ? '2px solid #3b5bdb' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isDisabled && !isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#151c27'
                  ;(e.currentTarget as HTMLElement).style.color = '#d1d5db'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = isDisabled ? '#3d4554' : '#9ca3af'
                }
              }}
            >
              <span style={{ opacity: isDisabled ? 0.3 : 1 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0 10px' }}>
        <button
          onClick={onNewAudit}
          style={{
            width: '100%',
            padding: '11px 12px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: hasData ? '#1d4ed8' : '#3b5bdb',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 16,
            letterSpacing: '0.01em',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
          onMouseLeave={e => (e.currentTarget.style.background = hasData ? '#1d4ed8' : '#3b5bdb')}
        >
          {hasData ? '+ New Audit' : 'Run Audit'}
        </button>

        {[
          { label: 'Settings', icon: '⚙', msg: 'System settings are managed by your administrator' },
          { label: 'Support', icon: '?', msg: 'Support ticket #8210 opened. Our team will contact you shortly.' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => onNotify(item.msg, 'info')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 2,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#151c27')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
