import { Bell, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="h-20 flex items-center justify-between px-8 z-20 relative border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm print:hidden">
      <div>
        <h2 className="text-sm font-medium text-slate-400">Workspace <span className="mx-2">/</span> <span className="text-slate-200">AI Fairness Auditor</span></h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px]">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </div>
    </header>
  )
}
