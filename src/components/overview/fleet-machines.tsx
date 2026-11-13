import { Cog, Settings2 } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { equipment, mainSequence } from '@/data/demo';
import { machines, machineAssetUrl } from '@/data/machine-catalog';
import { equipmentCapabilities, capabilityStatus } from '@/lib/equipment-capabilities';
import { EquipmentWidget } from '@/components/equipment-widget';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Device, Equipment } from '@/types';

function MachineButton({ item, device }: { item: Equipment; device: Device }) {
  const machine = machines.find(entry => String(entry.item) === item.item);
  const asset = machine ? machineAssetUrl(machine) : null;
  const reading = equipmentCapabilities(device, item.id).flatMap(capability => capability.readings).find(value => typeof value.value === 'number');
  return <Dialog><DialogTrigger asChild><button className="machine-icon-button" aria-label={`Detail dan pengaturan ${item.name} · ${device.id}`}>
    {asset ? <img src={asset} alt="" className="machine-icon-asset" /> : <Cog className="machine-icon-asset text-accent" />}
    <span>{item.name}</span><small>{!device.online ? 'Offline' : reading ? `${capabilityStatus(reading)} ${reading.unit ?? ''}` : 'Detail / Atur'}</small>
  </button></DialogTrigger><DialogContent className="max-w-3xl"><DialogTitle className="pr-6 font-semibold">{item.name} · {device.id}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">{item.function} {item.notes}</DialogDescription><p className="my-3 text-xs text-muted">Pembacaan dan target manual terpisah. Tidak ada perintah dikirim ke PLC.</p><div className="grid gap-3 sm:grid-cols-2"><EquipmentWidget equipment={item} device={device} /></div></DialogContent></Dialog>;
}

export function FleetMachines() {
  const { filteredDevices, device, selectDevice } = useDemo();
  return <section className="industrial-panel fleet-machines" aria-label="Mesin dalam masing-masing genset">
    <div className="industrial-heading"><h2>MESIN & PERANGKAT</h2><span>Klik ikon → detail / pengaturan</span></div>
    {filteredDevices.map(unit => <div key={unit.id} className={`machine-unit-row ${unit.id === device.id ? 'machine-unit-selected' : ''}`}>
      <div className="mb-1 flex items-center justify-between gap-2"><button onClick={() => selectDevice(unit.id)} aria-pressed={device.id === unit.id} className="text-[10px] font-semibold text-accent">{unit.id} · {unit.name}</button><span className="text-[9px] text-muted">{!unit.online ? 'Offline' : unit.status === 'standby' ? 'Standby' : unit.status === 'running' ? 'Running' : 'Status tidak diketahui'}</span></div>
      <div className="machine-icon-grid">{mainSequence.map(id => equipment.find(item => item.deviceId === unit.id && item.id === id)).filter((item): item is Equipment => !!item).map(item => <MachineButton key={item.instanceId} item={item} device={unit} />)}
        <Dialog><DialogTrigger asChild><button className="machine-icon-button" aria-label={`Seluruh perangkat ${unit.id}`}><Settings2 className="machine-icon-asset text-accent" /><span>Perangkat lain</span><small>Oli · udara · proteksi</small></button></DialogTrigger><DialogContent className="max-w-4xl"><DialogTitle className="font-semibold">Seluruh perangkat · {unit.id}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Klik ikon untuk pembacaan dan pengaturan lokal perangkat.</DialogDescription><div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{equipment.filter(item => item.deviceId === unit.id).map(item => <MachineButton key={item.instanceId} item={item} device={unit} />)}</div></DialogContent></Dialog>
      </div>
    </div>)}
  </section>;
}
