/// <reference types="vite/client" />

import machineData from './machines.json';
import instrumentData from './instruments.json';
import type { MachineAsset, MachineInstrument } from '@/types/machine-assets';

// Bundled inventory metadata only; never imports device state or readings.
export const machines = machineData as MachineAsset[];
export const instruments = instrumentData as MachineInstrument[];

export function instrumentsForMachine(machineId: string): MachineInstrument[] {
  return instruments.filter(instrument => instrument.relatedMachineIds.includes(machineId));
}

export function machineAssetUrl(machine: MachineAsset): string | null {
  return machine.asset ? `${import.meta.env.BASE_URL}${machine.asset}` : null;
}
