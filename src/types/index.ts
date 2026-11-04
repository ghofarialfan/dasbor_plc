export type OperatingStatus = 'running' | 'standby' | 'unknown';
export type VentilationFanStatus = 'running' | 'stopped' | 'offline' | 'unknown' | 'not-simulated';
export type VentilationFanMockStatus = Exclude<VentilationFanStatus, 'offline'>;
export type Parameter = 'rpm' | 'voltage' | 'frequency' | 'motorTemperature' | 'roomTemperature' | 'bldcTemperature';
export type Certainty = 'documented' | 'clarified' | 'assumed' | 'tbd';
export type IdentitySource = 'pid-draft' | 'project-colleague';
export interface EquipmentViewProps { selectedId: string; onSelect: (id: string) => void }
export type PathKind = 'electrical' | 'mechanical' | 'belt' | 'signal';
export type DataQuality = 'simulated' | 'not-simulated' | 'offline' | 'no-current-data';
// Definitions are reusable; equipment/instrument instances are explicitly scoped to a device.
export interface EquipmentDefinition {
  id: string; name: string; item: string; function: string; certainty: Certainty; notes: string;
  identitySources?: IdentitySource[]; draftIdentity?: string;
}
export interface Equipment extends EquipmentDefinition { deviceId: string; instanceId: string }
export interface InstrumentDefinition {
  tag: string; name: string; equipmentId: string; function: string;
  certainty: Certainty; signal: string; valueType: 'analog' | 'digital' | 'unresolved';
  parameters: Parameter[]; unit?: string; notes: string;
}
export interface Instrument extends InstrumentDefinition { deviceId: string; instanceId: string }
export interface FlowLink {
  id: string; from: string; to: string; kind: PathKind; certainty: Certainty; notes: string;
}
export interface InstrumentReading {
  deviceId: string; tag: string; parameter?: Parameter;
  value: number | boolean | null; unit?: string; quality: DataQuality;
}

export interface Telemetry {
  rpm: number | null; voltage: number | null; frequency: number | null;
  motorTemperature: number | null; roomTemperature: number | null;
  bldcTemperature: number | null;
}
export interface Device {
  id: string; name: string; siteId: string; location: string;
  status: OperatingStatus; online: boolean; lastSeen: string;
  telemetry: Telemetry;
}
export interface Alarm {
  id: string; deviceId: string; severity: 'warning' | 'offline'; title: string;
  description: string; timestamp: string;
  parameter?: Parameter; threshold?: number;
}
export interface Activity { id: string; deviceId: string; title: string; description: string; timestamp: string; kind: 'success' | 'warning' | 'offline' }
export interface TrendSample { timestamp: string; rpm: number | null; voltage: number | null; frequency: number | null; motorTemperature: number | null }
export interface GaugeWidgetConfig { id: string; deviceId: string; parameter: Parameter; title: string }
export interface Ticket { id: string; title: string; description: string; status: 'open' | 'resolved'; createdAt: string }
export type NewsCategory = 'operasional' | 'pemeliharaan' | 'keselamatan' | 'umum';
export interface NewsItem { id: string; category: NewsCategory; title: string; body: string; timestamp: string }
export interface SupportTicket { id: string; title: string; unit: string; category: string; description: string; relatedAlarm?: string; status: 'open' | 'resolved'; createdAt: string }
