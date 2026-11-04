import { useEffect, useState } from 'react';
import { Ticket, CircleCheck } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { seedTickets, alarms } from '@/data/demo';
import type { SupportTicket } from '@/types';
import { dateTime } from '@/lib/utils';
import { loadJSON, saveJSON } from '@/lib/storage';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';

function isTicketArray(v: unknown): v is SupportTicket[] {
  return Array.isArray(v) && v.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.description === 'string');
}

export function SupportPage() {
  const { filteredDevices } = useDemo();
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadJSON<SupportTicket[]>('tickets', seedTickets, isTicketArray));
  const [title, setTitle] = useState('');
  const [selectedUnit, setUnit] = useState('GEN-001');
  const unit = filteredDevices.some(d => d.id === selectedUnit) ? selectedUnit : filteredDevices[0].id;
  const [category, setCategory] = useState('Pemeliharaan');
  const [description, setDescription] = useState('');
  const [relatedAlarm, setRelatedAlarm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(t); }, [notice]);

  const submit = () => {
    if (!title.trim() || !description.trim()) { setError('Judul dan deskripsi wajib diisi.'); return; }
    if (title.trim().length > 120 || description.trim().length > 2000) { setError('Judul maksimal 120 karakter dan deskripsi maksimal 2000 karakter.'); return; }
    const next: SupportTicket[] = [{ id: `t-${Date.now()}`, title: title.trim(), unit, category, description: description.trim(), relatedAlarm: alarms.some(a => a.id === relatedAlarm && a.deviceId === unit) ? relatedAlarm : undefined, status: 'open', createdAt: new Date().toISOString() }, ...tickets];
    setTickets(next); if (!saveJSON('tickets', next)) { setError('Penyimpanan tidak tersedia; tiket hanya tersedia selama sesi ini.'); return; } setError(''); setNotice('Tiket berhasil dibuat'); setTitle(''); setDescription(''); setRelatedAlarm('');
  };

  return <div className="space-y-5">
    <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Support</h1><p className="mt-1 text-xs leading-relaxed text-muted">Tiket dan permintaan dukungan</p></div>
    {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
      <Panel className="min-w-0"><PanelHeading title="Daftar tiket" eyebrow={`${tickets.length} tiket`} />
        {tickets.length === 0 ? <EmptyState title="Belum ada tiket" description="Buat tiket untuk mencatat permintaan dukungan." /> : <div className="divide-y divide-slate-100 px-5 pb-5">{tickets.filter(t => filteredDevices.some(d => d.id === t.unit)).map(t => <div key={t.id} className="flex items-start gap-3 py-3.5"><Ticket size={16} className="mt-0.5 shrink-0 text-brand" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t.title}</p><p className="mt-1 text-[11px] text-muted">{t.unit} · {t.category}{t.relatedAlarm ? ` · terkait ${t.relatedAlarm}` : ''}</p><p className="mt-1 text-[11px] leading-relaxed text-muted">{t.description}</p><p className="mt-1 text-[10px] text-muted">{dateTime(t.createdAt)} · {t.status === 'open' ? 'Terbuka' : 'Selesai'}</p></div></div>)}</div>}
      </Panel>
      <Panel className="min-w-0"><PanelHeading title="Buat tiket" eyebrow="Formulir" />
        <div className="space-y-3 px-5 pb-5 text-xs">
          <label className="block"><span className="mb-1 block text-muted">Judul</span><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-white px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ringkasan singkat" /></label>
          <label className="block"><span className="mb-1 block text-muted">Unit</span><select value={unit} onChange={e => setUnit(e.target.value)} className="w-full rounded-lg border border-border bg-white px-2 py-2">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Kategori</span><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-white px-2 py-2">{['Pemeliharaan', 'Dokumentasi', 'Keselamatan', 'Umum'].map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Terkait alarm (opsional)</span><select value={relatedAlarm} onChange={e => setRelatedAlarm(e.target.value)} className="w-full rounded-lg border border-border bg-white px-2 py-2"><option value="">—</option>{alarms.filter(a => a.deviceId === unit).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Deskripsi</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-white px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan permintaan" /></label>
          {error && <p className="text-amber-700">{error}</p>}
          <Button onClick={submit} className="w-full"><CircleCheck size={15} />Buat tiket</Button>
          <p className="text-[10px] text-muted">Tiket tersimpan di perangkat ini dan belum dikirim ke server.</p>
        </div>
      </Panel>
    </div>
  </div>;
}
