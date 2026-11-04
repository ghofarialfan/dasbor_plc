import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { navigation } from '@/components/layout/navigation';
import { Panel } from '@/components/shared';
import { Button } from '@/components/ui/button';
export function Placeholder() {
  const location = useLocation();
  const item = navigation.find(n => n.path === location.pathname);
  return <Panel className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-brand">{item ? <item.icon size={30} strokeWidth={1.5} /> : <Construction size={30} />}</div><p className="text-[10px] font-semibold uppercase tracking-widest text-brand">{item ? `Direncanakan · Milestone ${item.milestone}` : '404 · Halaman tidak ditemukan'}</p><h1 className="mt-3 text-2xl font-semibold">{item?.label ?? 'Halaman tidak tersedia'}</h1><p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{item?.path === '/logout' ? 'Alur konfirmasi akhir sesi belum dibuat. Tidak ada sesi server atau autentikasi nyata.' : 'Milestone 1 berfokus pada App Shell dan Overview. Halaman ini belum diimplementasikan dan tidak menjalankan operasi perangkat.'}</p><Button asChild className="mt-6"><Link to="/"><ArrowLeft size={16} />Kembali ke Overview</Link></Button></Panel>;
}
