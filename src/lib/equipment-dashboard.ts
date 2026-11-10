export const equipmentDashboardGroups = [
  { id: 'electrical', title: 'Output & PLTS', description: 'Tegangan, arus, daya dan frekuensi', tags: ['PM-01', 'PV-01'] },
  { id: 'drive', title: 'Penggerak & alternator', description: 'Poros, motor, BLDC, alternator dan PMG', tags: ['ST-401', 'TT-02', 'TT-03', 'TT-12', 'VT-401', 'VT-07', 'TT-07', 'TT-10', 'ST-10', 'AVR-01'] },
  { id: 'oil', title: 'Pelumasan', description: 'Tekanan, suhu, filter dan sakelar level rendah', tags: ['PT-201', 'PDT-201', 'TT-201', 'LSL-19', 'LSL-20'] },
  { id: 'air', title: 'Ventilasi & lingkungan', description: 'Suhu udara, filter, damper dan kipas', tags: ['TT-303', 'AT-301', 'TT-301', 'TT-304', 'PDT-301', 'DMP-301', 'M-301'] },
  { id: 'status', title: 'Status & keamanan', description: 'Sinyal digital dan kondisi perangkat; bukan status kesehatan keseluruhan', tags: [] },
] as const;

// Every registry tag belongs to exactly one display group; unknown tags stay visible.
export function equipmentDashboardGroup(tag: string): string {
  return equipmentDashboardGroups.find(group => (group.tags as readonly string[]).includes(tag))?.id ?? 'status';
}

export function dashboardTagGroups(tags: string[]) {
  return equipmentDashboardGroups.map(group => ({
    ...group,
    tags: tags.filter(tag => equipmentDashboardGroup(tag) === group.id),
  })).filter(group => group.tags.length > 0);
}
