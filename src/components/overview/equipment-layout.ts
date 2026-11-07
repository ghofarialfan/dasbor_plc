export interface EquipmentLayoutPosition {
  machineId: string;
  item: number;
  label: string;
  labelWidth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  anchors: { left: Point; right: Point; top: Point; bottom: Point };
}

export interface Point { x: number; y: number }
export type AnchorName = keyof EquipmentLayoutPosition['anchors'];

export const overviewViewBox = { width: 1200, height: 744 } as const;
export const overviewBounds = {
  container: { x: 24, y: 32, width: 940, height: 620 },
  roof: { x: 48, y: 56, width: 224, height: 108 },
  equipment: { x: 48, y: 188, width: 892, height: 440 },
  outputArea: { x: 992, y: 284, width: 184, height: 168 },
  legend: { x: 24, y: 676, width: 1152, height: 54 },
  routes: { leftCableX: 36, beltStartX: 800, beltJunctionX: 812, outputJoinX: 984, lubricationY: 364 },
} as const;

const items = [
  { machineId: 'machine-01', item: 1, label: 'PLTS', labelWidth: 46, x: 55, y: 65, width: 104, height: 58 },
  // Shared shaft centreline; equal equipment classes use equal presentation sizes.
  { machineId: 'machine-02', item: 2, label: 'Motor AC', labelWidth: 72, x: 64, y: 184, width: 72, height: 72 },
  { machineId: 'machine-03', item: 3, label: 'Motor', labelWidth: 72, x: 160, y: 184, width: 72, height: 72 },
  { machineId: 'machine-04', item: 4, label: 'Gearbox', labelWidth: 72, x: 256, y: 188, width: 64, height: 64 },
  { machineId: 'machine-05', item: 5, label: 'Gearbox', labelWidth: 72, x: 344, y: 188, width: 64, height: 64 },
  { machineId: 'machine-06', item: 6, label: 'Motor', labelWidth: 72, x: 432, y: 184, width: 72, height: 72 },
  { machineId: 'machine-07', item: 7, label: 'Alternator', labelWidth: 88, x: 528, y: 176, width: 88, height: 88 },
  { machineId: 'machine-08', item: 8, label: 'Gearbox', labelWidth: 72, x: 640, y: 188, width: 64, height: 64 },
  { machineId: 'machine-09', item: 9, label: 'Gearbox', labelWidth: 72, x: 728, y: 188, width: 64, height: 64 },
  { machineId: 'machine-10', item: 10, label: 'PMG', labelWidth: 72, x: 824, y: 184, width: 72, height: 72 },
  { machineId: 'machine-11', item: 11, label: 'PMG', labelWidth: 72, x: 824, y: 304, width: 72, height: 72 },
  { machineId: 'machine-12', item: 12, label: 'Motor BLDC', labelWidth: 88, x: 72, y: 436, width: 72, height: 72 },
  { machineId: 'machine-13', item: 13, label: 'Kabinet', labelWidth: 72, x: 184, y: 436, width: 72, height: 72 },
  { machineId: 'machine-14', item: 14, label: 'Rak modul', labelWidth: 80, x: 296, y: 428, width: 72, height: 88 },
  { machineId: 'machine-15', item: 15, label: 'Manifold', labelWidth: 72, x: 440, y: 328, width: 64, height: 64 },
  { machineId: 'machine-16', item: 16, label: 'Kabinet', labelWidth: 72, x: 504, y: 436, width: 72, height: 72 },
  { machineId: 'machine-17', item: 17, label: 'Output 380 V', labelWidth: 104, x: 1048, y: 248, width: 72, height: 72 },
  { machineId: 'machine-19', item: 19, label: 'Tangki TK-19', labelWidth: 96, x: 292, y: 320, width: 80, height: 64 },
  { machineId: 'machine-20', item: 20, label: 'Tangki TK-20', labelWidth: 96, x: 676, y: 320, width: 80, height: 64 },
] as const;

export const equipmentLayout: EquipmentLayoutPosition[] = items.map(source => {
  // Reserve a heading row and bottom padding without changing equipment sizes or alignment.
  const item = { ...source, y: source.y + (source.item === 1 ? 8 : 64) };
  return {
    ...item,
    anchors: {
      left: { x: item.x, y: item.y + item.height / 2 },
      right: { x: item.x + item.width, y: item.y + item.height / 2 },
      top: { x: item.x + item.width / 2, y: item.y },
      bottom: { x: item.x + item.width / 2, y: item.y + item.height },
    },
  };
});

export interface EquipmentEndpoint { item: number; anchor: AnchorName }
export interface CorridorEndpoint { corridor: 'beltStart' | 'outputJoin' }
interface ShaftConnection { id: string; style: 'shaft'; from: EquipmentEndpoint; to: EquipmentEndpoint; provenance: string; certainty: 'conceptual' }
interface BeltConnection { id: string; style: 'belt'; from: CorridorEndpoint; to: EquipmentEndpoint; provenance: string; certainty: 'source and route TBD' }
interface EquipmentCableConnection { id: string; style: 'cable'; from: EquipmentEndpoint; to: EquipmentEndpoint; route: 'left' | 'direct'; provenance: string; certainty: 'conceptual' }
interface BranchCableConnection { id: string; style: 'cable'; from: EquipmentEndpoint; to: CorridorEndpoint; branch: 'upper' | 'lower'; provenance: string; certainty: 'conceptual' }
interface OutputCableConnection { id: string; style: 'cable'; from: CorridorEndpoint; to: EquipmentEndpoint; provenance: string; certainty: 'conceptual' }
interface LubricationConnection { id: string; style: 'lubrication'; from: EquipmentEndpoint; to: EquipmentEndpoint; provenance: string; certainty: 'functional mapping clarified; physical route TBD' }
export type OverviewConnection = ShaftConnection | BeltConnection | EquipmentCableConnection | BranchCableConnection | OutputCableConnection | LubricationConnection;

export const overviewConnections: OverviewConnection[] = [
  ...[[19, 4], [19, 5], [20, 8], [20, 9]].map(([tank, gearbox]) => ({
    id: `oil-${tank}-${gearbox}`, style: 'lubrication' as const,
    from: { item: tank, anchor: 'top' as const }, to: { item: gearbox, anchor: 'bottom' as const },
    provenance: 'User confirmed direct supply: TK-19 to gearboxes 4/5; TK-20 to gearboxes 8/9',
    certainty: 'functional mapping clarified; physical route TBD' as const,
  })),
  ...[[2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]].map(([from, to]) => ({
    id: `shaft-${from}-${to}`, style: 'shaft' as const,
    from: { item: from, anchor: 'right' as const }, to: { item: to, anchor: 'left' as const },
    provenance: 'Draft legend: shaft/coupling', certainty: 'conceptual' as const,
  })),
  ...[10, 11].map(item => ({
    id: `belt-${item}`, style: 'belt' as const,
    from: { corridor: 'beltStart' as const }, to: { item, anchor: 'left' as const },
    provenance: 'Draft legend: belt to items 10/11', certainty: 'source and route TBD' as const,
  })),
  { id: 'cable-1-12', style: 'cable' as const, from: { item: 1, anchor: 'left' as const }, to: { item: 12, anchor: 'left' as const }, route: 'left' as const, provenance: 'Visible draft geometry as specified by reviewer', certainty: 'conceptual' as const },
  ...[[12, 13], [13, 14], [14, 16]].map(([from, to]) => ({
    id: `cable-${from}-${to}`, style: 'cable' as const,
    from: { item: from, anchor: 'right' as const }, to: { item: to, anchor: 'left' as const },
    route: 'direct' as const, provenance: 'Visible draft geometry as specified by reviewer', certainty: 'conceptual' as const,
  })),
  ...[10, 11].map(item => ({
    id: `cable-${item}-17-branch`, style: 'cable' as const,
    from: { item, anchor: 'right' as const }, to: { corridor: 'outputJoin' as const },
    branch: item === 10 ? 'upper' as const : 'lower' as const, provenance: 'Visible draft geometry as specified by reviewer', certainty: 'conceptual' as const,
  })),
  { id: 'cable-output-17', style: 'cable' as const, from: { corridor: 'outputJoin' as const }, to: { item: 17, anchor: 'left' as const }, provenance: 'Visible draft geometry as specified by reviewer', certainty: 'conceptual' as const },
];

export function getEquipmentAnchor(item: number, anchor: AnchorName): Point {
  const position = equipmentLayout.find(entry => entry.item === item);
  if (!position) throw new Error(`Missing overview position for item ${item}`);
  return position.anchors[anchor];
}

export const overviewEquipmentIdByItem: Partial<Record<number, string>> = {
  1: 'pv', 2: 'motor', 3: 'motor3', 4: 'gearbox4', 5: 'gearbox5', 6: 'motor6',
  7: 'alternator', 8: 'gearbox8', 9: 'gearbox9', 10: 'pmg', 11: 'pmg',
  12: 'bldc', 13: 'cabinet', 15: 'manifold15', 17: 'output', 19: 'oil19', 20: 'oil20',
};

// Shared detail identity; combined legacy PMG metadata must not merge catalog items.
export function getOverviewDetailId(item: number): string {
  if (item === 10 || item === 11 || item === 14 || item === 16) return `catalog-item-${item}`;
  return overviewEquipmentIdByItem[item] ?? `catalog-item-${item}`;
}
