import { LayoutDashboard, UploadCloud, Settings, ShieldCheck } from 'lucide-react'

export default function Sidebar({ currentView, setCurrentView }: any) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 relative print:hidden">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">BiasLens</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
        <button 
          onClick={() => setCurrentView('upload')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'upload' ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <UploadCloud className="w-5 h-5" />
          New Audit
        </button>
        <button 
          onClick={() => setCurrentView('report')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'report' ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Audit Report
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  )
}
