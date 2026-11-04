import { timezoneLabel } from '@/lib/preferences';
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, Building2, ChevronDown, Menu, UserRound, TriangleAlert, Clock3 } from 'lucide-react';
import { Sidebar } from './sidebar';
import { navigation } from './navigation';
import { useDemo } from '@/context/demo-context';
import { DEMO_NOW, sites } from '@/data/demo';
import { cn, dateTime, time } from '@/lib/utils';
import { DemoBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

function ProfileMenu() {
  return <DropdownMenu><DropdownMenuTrigger asChild><button aria-label="Menu profil" className="flex items-center gap-2 rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-brand"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">AD</span><span className="hidden text-left sm:block"><span className="block text-xs font-semibold">Alex</span><span className="block text-[10px] text-muted">Operator</span></span><ChevronDown size={13} className="hidden text-muted sm:block" /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel className="px-3 py-2 text-xs text-muted">Profil pengguna</DropdownMenuLabel><DropdownMenuItem asChild><Link to="/profile"><UserRound size={16} />Profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/logout">Logout</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { siteId, setSite, filteredAlarms, selectDevice, storageError, preferences } = useDemo();
  const location = useLocation();
  const page = navigation.find(n => n.path === location.pathname)?.label ?? 'Halaman tidak ditemukan';
  return <div className="min-h-dvh bg-background">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">Lewati ke konten</a>
    <aside className={cn('fixed inset-y-0 left-0 z-40 hidden md:block', collapsed ? 'w-[76px]' : 'w-[76px] xl:w-[232px]')}><div className={cn('h-full', !collapsed && 'hidden xl:block')}><Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} /></div>{!collapsed && <div className="h-full xl:hidden"><Sidebar collapsed /></div>}</aside>
    <div className={cn('min-w-0 md:ml-[76px]', !collapsed && 'xl:ml-[232px]')}>
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="flex min-h-[72px] items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}><DialogTrigger asChild><Button size="icon" variant="ghost" className="md:hidden" aria-label="Buka menu"><Menu size={21} /></Button></DialogTrigger><DialogContent drawer><DialogTitle className="sr-only">Menu navigasi</DialogTitle><DialogDescription className="sr-only">Pilih halaman dashboard.</DialogDescription><Sidebar onNavigate={() => setDrawerOpen(false)} /></DialogContent></Dialog>
            <div className="hidden items-center gap-2 text-muted sm:flex"><Building2 size={17} /><span className="text-xs">Workspace</span><span className="mx-1 text-slate-300">/</span></div>
            <label className="sr-only" htmlFor="site-select">Pilih site</label><select id="site-select" value={siteId} onChange={e => setSite(e.target.value)} className="min-w-0 max-w-[155px] cursor-pointer rounded-lg border border-border bg-white py-2 pl-2 pr-5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-[230px]"><option value="all">Semua Site</option>{sites.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden lg:block"><DemoBadge /></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Notifikasi: ${filteredAlarms.length} alarm aktif`} className="relative"><Bell size={19} />{preferences.notifications && filteredAlarms.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">{filteredAlarms.length}</span>}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80"><DropdownMenuLabel className="px-3 py-2 text-xs font-semibold">Alarm · site terpilih</DropdownMenuLabel><DropdownMenuSeparator />{filteredAlarms.length ? filteredAlarms.map(a => <DropdownMenuItem asChild key={a.id}><Link to="/" onClick={() => selectDevice(a.deviceId)}><TriangleAlert size={16} className="shrink-0 text-amber-600" /><div><p className="text-xs font-semibold">{a.deviceId} · {a.title}</p><p className="mt-1 text-[10px] text-muted">{time(a.timestamp)} {timezoneLabel()} · lihat di Overview</p></div></Link></DropdownMenuItem>) : <p className="p-3 text-xs text-muted">Tidak ada alarm untuk site ini.</p>}</DropdownMenuContent></DropdownMenu>
            <div className="h-7 w-px bg-border" />
            <ProfileMenu />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 sm:px-6 lg:hidden"><DemoBadge /><span className="hidden text-[10px] text-muted sm:block">Workspace</span></div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-[11px] text-muted"><span>Workspace</span><span className="text-slate-300">/</span><span className="font-medium text-foreground">{page}</span></div>
        {storageError && <div role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Preferensi site tidak dapat disimpan. Halaman tetap berfungsi selama sesi ini.</div>}
        <Outlet />
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-border py-4 text-[10px] text-muted"><span>GensetMonitor</span><span className="flex items-center gap-1.5"><Clock3 size={12} />Pembaruan terakhir: {dateTime(DEMO_NOW)}</span></footer>
      </main>
    </div>
  </div>;
}
