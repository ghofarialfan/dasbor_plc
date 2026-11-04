import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { saveJSON, removeAllDemoKeys } from '@/lib/storage';
import { Panel, PanelHeading } from '@/components/shared';
import { Button } from '@/components/ui/button';

import { preferences, notifyPreferences, type Preferences } from '@/lib/preferences';

export function ProfilePage() {
  const [profile, setProfile] = useState<Preferences>(preferences);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const commit = (next: Preferences) => { setProfile(next); setStorageError(false); if (saveJSON('profile', next)) { notifyPreferences(); setSaved(true); } else { setStorageError(true); } setTimeout(() => setSaved(false), 2500); };
  return <div className="space-y-5">
    <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Profile</h1><p className="mt-1 text-xs leading-relaxed text-muted">Preferensi pengguna</p></div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel className="min-w-0"><PanelHeading title="Profil" eyebrow="Pengguna" />
        <div className="flex items-center gap-3 px-5 pb-5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">AD</span><div><p className="text-sm font-semibold">Alex</p><p className="text-xs text-muted">Operator · akses tampilan</p></div></div>
      </Panel>
      <Panel className="min-w-0"><PanelHeading title="Preferensi" eyebrow="Pengaturan" />
        <div className="space-y-3 px-5 pb-5 text-xs">
          <label className="block"><span className="mb-1 block text-muted">Zona waktu</span><select value={profile.timezone} onChange={e => commit({ ...profile, timezone: e.target.value })} className="w-full rounded-lg border border-border bg-white px-2 py-2"><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option><option value="Asia/Makassar">Asia/Makassar (WITA)</option><option value="Asia/Jayapura">Asia/Jayapura (WIT)</option></select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.notifications} onChange={e => commit({ ...profile, notifications: e.target.checked })} />Notifikasi aktif</label>
          {storageError && <p role="alert" className="text-amber-700">Preferensi tidak dapat disimpan.</p>}
          {saved && <p className="text-emerald-700">Preferensi tersimpan.</p>}
        </div>
      </Panel>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Pengaturan data" eyebrow="Reset" />
      <div className="px-5 pb-5 text-xs"><p className="mb-3 text-muted">Kembalikan semua preferensi, widget, dan tiket ke kondisi awal.</p><Button variant="outline" onClick={() => { removeAllDemoKeys(); window.location.reload(); }}><RotateCcw size={15} />Kembalikan pengaturan awal</Button></div>
    </Panel>
  </div>;
}
