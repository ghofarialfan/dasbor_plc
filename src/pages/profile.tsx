import { useEffect, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';
import { saveJSON, removeAllDemoKeys } from '@/lib/storage';
import { Panel, PanelHeading } from '@/components/shared';
import { Button } from '@/components/ui/button';

import { preferences, notifyPreferences, type Preferences } from '@/lib/preferences';

export function ProfilePage() {
  const { preferences: sharedPreferences } = useDemo();
  const [profile, setProfile] = useState<Preferences>(preferences);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState(false);
  useEffect(() => setProfile(sharedPreferences), [sharedPreferences]);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const commit = (next: Preferences) => { setProfile(next); setStorageError(false); if (saveJSON('profile', next)) { notifyPreferences(); setSaved(true); } else { setProfile(sharedPreferences); setStorageError(true); } setTimeout(() => setSaved(false), 2500); };
  return <div className="space-y-5">
    <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand dark:text-accent">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Profile</h1><p className="mt-1 text-xs leading-relaxed text-muted">Preferensi pengguna</p></div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel className="min-w-0"><PanelHeading title="Profil" eyebrow="Pengguna" />
        <div className="flex items-center gap-3 px-5 pb-5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-accent-soft text-sm font-bold text-blue-700 dark:text-accent">AD</span><div><p className="text-sm font-semibold">Alex</p><p className="text-xs text-muted">Operator · akses tampilan</p></div></div>
      </Panel>
      <Panel className="min-w-0"><PanelHeading title="Preferensi" eyebrow="Pengaturan" />
        <div className="space-y-3 px-5 pb-5 text-xs">
          <label className="block"><span className="mb-1 block text-muted">Zona waktu</span><select value={profile.timezone} onChange={e => commit({ ...profile, timezone: e.target.value })} className="w-full rounded-lg border border-border bg-white dark:bg-surface px-2 py-2"><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option><option value="Asia/Makassar">Asia/Makassar (WITA)</option><option value="Asia/Jayapura">Asia/Jayapura (WIT)</option></select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.notifications} onChange={e => commit({ ...profile, notifications: e.target.checked })} />Notifikasi aktif</label>
          {storageError && <p role="alert" className="text-amber-700 dark:text-warning">Preferensi tidak dapat disimpan.</p>}
          {saved && <p className="text-emerald-700 dark:text-success">Preferensi tersimpan.</p>}
        </div>
      </Panel>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Pengaturan data" eyebrow="Reset" />
      <div className="px-5 pb-5 text-xs"><p className="mb-3 text-muted">Kembalikan semua preferensi, widget, pengaturan perangkat lokal, riwayat perubahan, dan tiket ke kondisi awal.</p><Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogTrigger asChild><Button variant="outline"><RotateCcw size={15} />Kembalikan pengaturan awal</Button></DialogTrigger><DialogContent><DialogTitle className="text-lg font-semibold">Kembalikan pengaturan awal?</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Pilihan site/unit, preferensi, tata letak kamera, widget, tiket, target, skenario, dan riwayat perubahan lokal akan dihapus dan diganti seed awal. Tindakan ini tidak dapat dibatalkan; telemetry tidak berubah.</DialogDescription>{resetError && <p role="alert" className="mt-3 text-xs text-amber-700 dark:text-warning">Reset tidak selesai. Penyimpanan browser tidak dapat dihapus; sebagian key mungkin sudah terhapus. Coba lagi.</p>}<div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setResetOpen(false)}>Batal</Button><Button onClick={() => { if (removeAllDemoKeys()) window.location.reload(); else setResetError(true); }}>Ya, kembalikan</Button></div></DialogContent></Dialog></div>
    </Panel>
  </div>;
}
