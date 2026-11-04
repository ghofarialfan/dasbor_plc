import { NavLink } from 'react-router-dom';
import { Zap, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigation } from './navigation';
import { Hint } from '@/components/ui/tooltip';

export function Sidebar({ collapsed = false, onCollapse, onNavigate }: { collapsed?: boolean; onCollapse?: () => void; onNavigate?: () => void }) {
  return <div className="flex h-full flex-col bg-navy text-slate-300">
    <div className={cn('flex h-[88px] shrink-0 items-center gap-3 px-6', collapsed && 'justify-center px-2')}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600"><Zap size={23} className="text-white" fill="currentColor" /></div>{!collapsed && <div><p className="text-[17px] font-bold tracking-tight text-white">Genset<span className="font-normal text-blue-300">Monitor</span></p><p className="mt-0.5 text-[9px] uppercase tracking-[0.23em] text-slate-400">Industrial monitoring</p></div>}</div>
    <div className="flex-1 overflow-y-auto px-3 pb-4">{!collapsed && <p className="px-3 pb-3 pt-3 text-[9px] font-semibold uppercase tracking-[0.19em] text-slate-500">Workspace</p>}
      <nav aria-label="Navigasi utama" className="space-y-1">{navigation.map((item, i) => {
        const link = <NavLink end={item.path === '/'} to={item.path} onClick={onNavigate} aria-label={collapsed ? item.label : undefined} className={({ isActive }) => cn('flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors hover:bg-white/5 hover:text-white', isActive && 'bg-blue-600/20 text-blue-200 ring-1 ring-inset ring-blue-500/20', collapsed && 'justify-center px-2', i === 8 && 'mt-5')}><item.icon size={18} strokeWidth={1.7} />{!collapsed && <span>{item.label}</span>}</NavLink>;
        return collapsed ? <Hint label={item.label} key={item.path}>{link}</Hint> : <div key={item.path}>{link}</div>;
      })}</nav>
    </div>
    {!collapsed && <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3"><div className="flex items-center gap-2 text-xs font-medium text-slate-200"><ShieldCheck size={16} className="text-blue-300" />Frontend prototype</div><p className="mt-2 text-[10px] leading-relaxed text-slate-400">Simulasi lokal. Tidak terhubung ke PLC atau perangkat nyata.</p></div>}
    {onCollapse && <button onClick={onCollapse} aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'} className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-white/10 text-xs text-slate-400 hover:text-white">{collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} />Ciutkan menu</>}</button>}
  </div>;
}
