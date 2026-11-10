import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Panel } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function LogoutPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  return <Panel className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
    {ended ? <>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-accent-soft text-brand dark:text-accent"><LogOut size={30} strokeWidth={1.5} /></div>
      <h1 id="session-ended" tabIndex={-1} className="text-2xl font-semibold">Anda telah keluar</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">Sesi telah berakhir.</p>
      <Button asChild className="mt-6"><Link to="/">Masuk kembali</Link></Button>
    </> : <>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-accent-soft text-brand dark:text-accent"><LogOut size={30} strokeWidth={1.5} /></div>
      <h1 className="text-2xl font-semibold">Keluar</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">Akhiri sesi saat ini.</p>
      <button id="logout-trigger" className="mt-6 rounded-lg bg-brand px-4 py-2 text-white" onClick={() => setConfirmOpen(true)}>Keluar</button>
    </>}
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); document.getElementById(ended ? 'session-ended' : 'logout-trigger')?.focus(); }}><DialogTitle className="text-lg font-semibold">Konfirmasi keluar</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Anda akan diarahkan ke layar akhir sesi.</DialogDescription><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button><Button onClick={() => { setConfirmOpen(false); setEnded(true); }}>Ya, keluar</Button></div></DialogContent></Dialog>
  </Panel>;
}
