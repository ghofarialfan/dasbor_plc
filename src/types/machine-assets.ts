import type { Certainty, OperatingStatus } from '@/types';

export type MachineTemplate = 'motor' | 'gearbox' | 'oil-tank' | 'alternator' | 'pmg' | 'bldc-motor' | 'cabinet-control' | 'cabinet-rack' | 'cabinet-generic' | 'manifold' | 'solar-panel' | 'output-point';
export type RelationScope = 'component' | 'area' | 'system' | 'unresolved';

// Conceptual inventory definitions, not device instances or telemetry readings.
export interface MachineAsset {
  id: string;
  item: number;
  name: string;
  template: MachineTemplate | null;
  asset: string | null;
  function: string;
  status: Extract<OperatingStatus, 'unknown'>;
  identityCertainty: Certainty;
  geometryCertainty: 'generic-reference' | 'unresolved';
  functionCertainty: Certainty;
  mappingCertainty: Certainty;
  sources: string[];
  notes: string[];
}

export interface MachineInstrument {
  tag: string;
  name: string;
  function: string;
  valueType: 'analog' | 'digital' | 'unresolved';
  signal: string;
  unit: string | null;
  relationScope: RelationScope;
  relatedMachineIds: string[];
  mappingStatus: 'documented' | 'unresolved';
  certainty: Certainty;
  status: Extract<OperatingStatus, 'unknown'>;
  runtimeBindings: [];
  sources: string[];
  notes: string[];
}
