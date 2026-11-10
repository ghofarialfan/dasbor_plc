import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const [devicePage, navigationSource, legacyGallery, gallerySource, equipmentDetailSource] = await Promise.all([
  '../src/pages/device.tsx', '../src/components/layout/navigation.ts', '../src/pages/machines.tsx',
  '../src/components/machines/machine-gallery.tsx', '../src/components/overview/equipment-details.tsx',
].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
assert.ok(devicePage.includes("label: 'Ringkasan'") && devicePage.includes("label: 'Mesin & instrumen'"));
assert.ok(devicePage.includes('role="tablist"') && devicePage.includes('role="tabpanel"'));
for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) assert.ok(devicePage.includes(key));
assert.ok(devicePage.includes('deviceId={device.id}') && devicePage.includes('selectDevice(event.target.value)'));
assert.ok(!navigationSource.includes("path: '/machines'"), 'gallery must not remain a separate navigation entry');
assert.ok(legacyGallery.includes('<Navigate to="/device?tab=machines" replace />'));
assert.ok(gallerySource.includes('bukan inventaris aktual terverifikasi per unit'));
assert.ok(gallerySource.includes('bukan foto perangkat'));
assert.ok(equipmentDetailSource.includes('Lihat di Device'));
console.log('PASS: Device gallery integration, accessible tab structure, shared-unit context, legacy redirect and conceptual inventory labels.');
const [overviewSource, alertsSource] = await Promise.all([
  '../src/pages/overview.tsx', '../src/components/overview/alerts-activity.tsx',
].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
const overviewAst = ts.createSourceFile('overview.tsx', overviewSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const overviewComponents = [];
function collectOverviewComponents(node) {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) overviewComponents.push(node.tagName.getText(overviewAst));
  ts.forEachChild(node, collectOverviewComponents);
}
collectOverviewComponents(overviewAst);
for (const name of ['EquipmentWidget', 'DashboardHistory']) assert.equal(overviewComponents.filter(tag => tag === name).length, 1, `${name} must be integrated once`);
assert.ok(!overviewComponents.includes('SystemOverview') && !overviewComponents.includes('GaugeCard'), 'large diagram and duplicate gauges must not consume dashboard space');
assert.ok(overviewSource.includes('overviewEquipmentGroups(device)') && overviewSource.includes('visibleTags={tags} compact'));
assert.ok(overviewSource.includes('alarm.deviceId === device.id') && overviewSource.includes('activity.deviceId === device.id'), 'Overview notifications belong to the active unit');
const overviewHistorySource = await readFile(new URL('../src/components/overview/dashboard-history.tsx', import.meta.url), 'utf8');
assert.ok(overviewHistorySource.includes('historyParameters.map(parameter => <ParameterHistory'));
assert.ok(overviewHistorySource.includes('demoChannelReading(device, binding.tag') && overviewHistorySource.includes('connectNulls={false}'));
assert.ok(overviewHistorySource.includes('historyDisplayIndices') && overviewHistorySource.includes('historyStats'));
const indicatorSource = await readFile(new URL('../src/lib/channel-indicator.ts', import.meta.url), 'utf8');
const indicatorJs = ts.transpileModule(indicatorSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { channelIndicatorKind, indicatorFraction } = await import(`data:text/javascript;base64,${Buffer.from(indicatorJs).toString('base64')}`);
for (const [unit, kind] of [['°C', 'temperature'], ['rpm', 'speed'], ['%', 'percentage'], ['%RH', 'percentage'], ['bar', 'bullet'], ['Pa', 'bullet'], ['mm/s', 'bullet'], ['V', 'bar'], ['A', 'bar'], ['Hz', 'bar'], ['kW', 'bar']]) {
  assert.equal(channelIndicatorKind(unit, false), kind);
  assert.equal(channelIndicatorKind(unit, true), 'digital');
}
for (const [value, max, expected] of [[null, 100, null], [NaN, 100, null], [Infinity, 100, null], [10, undefined, null], [10, 0, null], [10, -1, null], [10, Infinity, null], [-5, 100, 0], [0, 100, 0], [25, 100, 0.25], [150, 100, 1]]) assert.equal(indicatorFraction(value, max), expected);
console.log('PASS: semantic card indicator mapping, null/invalid ranges and bounded display fractions.');
const overviewCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
assert.ok(overviewCss.includes('(min-width: 1800px) and (min-height: 900px)'));
assert.ok(overviewCss.includes('(max-height: 999px)'));
assert.ok(overviewHistorySource.includes('Tren analog · line chart') && overviewHistorySource.includes('Riwayat status digital · step chart 0/1'));
assert.ok(!overviewCss.includes('overflow: hidden'), 'dashboard must not conceal overflowing readings');
assert.ok(alertsSource.includes('Notifikasi site') && alertsSource.includes('Site terpilih · seluruh unit'));
assert.ok(alertsSource.includes('max-h-64 overflow-y-auto') && alertsSource.includes('tabIndex={0}'));
assert.ok(alertsSource.includes('[...filteredActivities].sort('), 'activity ordering must not mutate context');
assert.ok(alertsSource.includes('filteredAlarms.map('), 'all active alarms remain accessible without truncation');
for (const attribute of ['role="tablist"', 'role="tab"', 'role="tabpanel"', 'aria-selected=', 'aria-controls=', 'aria-labelledby=', 'hidden={tab !== index}']) assert.ok(alertsSource.includes(attribute));
for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) assert.ok(alertsSource.includes(key));
assert.ok(alertsSource.includes('const [tab, setTab] = useState(0)'), 'alarm tab selected initially');
assert.ok(alertsSource.includes('<NotificationTabs key={siteId} />'), 'changing site resets to alarms');
assert.ok(alertsSource.includes('role="status"') && alertsSource.includes('{filteredAlarms.length} alarm aktif'), 'alarm count persists in panel header');
assert.ok(alertsSource.indexOf('role="status"') < alertsSource.indexOf('role="tablist"'), 'persistent alarm indicator outside tabs');
assert.ok(alertsSource.includes('selectDevice(a.deviceId)'), 'notifications select their associated unit');
console.log('PASS: compact site notification tabs, persistent alarm count, keyboard navigation, default alarm tab and responsive Overview order.');
const source = await readFile(new URL('../src/data/demo.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const data = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const { devices, devicesForSite, deviceForSite, alarms, activities, trends, MOTOR_DEMO_THRESHOLD, DEMO_NOW } = data;
assert.equal(devices.length, 4);
assert.equal(data.sites.length, 2);
for (const site of ['all', ...data.sites.map(s => s.id)]) {
  const list = devicesForSite(site);
  assert.ok(list.length > 0);
  for (const selected of devices) assert.ok(list.includes(deviceForSite(site, selected.id)));
  const ids = new Set(list.map(d => d.id));
  assert.ok(activities.filter(a => ids.has(a.deviceId)).length >= list.length * 90);
}
assert.deepEqual(devices[0].telemetry, { rpm: 500, voltage: 380, frequency: 50, motorTemperature: 31, roomTemperature: 27, bldcTemperature: 33 });
const warning = alarms.find(a => a.severity === 'warning');
assert.equal(warning.deviceId, 'GEN-002');
assert.equal(warning.parameter, 'motorTemperature');
assert.equal(warning.threshold, MOTOR_DEMO_THRESHOLD);
assert.ok(devices[1].telemetry.motorTemperature > warning.threshold);
assert.ok(warning.description.includes('ambang peringatan'));
assert.ok(Object.values(devices[3].telemetry).every(v => v === null));
assert.equal(devices[3].status, 'unknown');
assert.ok(Date.parse(devices[3].lastSeen) < Date.parse(DEMO_NOW));
for (const d of devices) {
  const samples = trends[d.id];
  assert.equal(samples.length, 90 * 24 * 12 + 1);
  assert.equal(samples.at(-1).timestamp, DEMO_NOW);
  for (const key of ['rpm', 'voltage', 'frequency', 'motorTemperature']) assert.equal(samples.at(-1)[key], d.telemetry[key]);
  for (const hours of [1, 3, 6]) assert.equal(samples.slice(-(hours * 12 + 1)).length, hours * 12 + 1);
}
assert.ok(trends['GEN-004'].every(s => s.voltage === null && s.rpm === null));
assert.ok(trends['GEN-003'].every(s => (s.voltage === 0 && s.rpm === 0) || (s.voltage === null && s.rpm === null)));
assert.notDeepEqual(trends['GEN-001'].slice(-13), trends['GEN-002'].slice(-13));
const { equipment, instruments, equipmentDefinitions, instrumentDefinitions, mainSequence, flowLinks, parameters, parameterQuality, readingsForInstrument, certaintyLabels } = data;
assert.equal(certaintyLabels.documented, 'Tercantum di draf');
assert.deepEqual(mainSequence, ['pv', 'cabinet', 'bldc', 'motor', 'motor3', 'gearbox4', 'gearbox5', 'motor6', 'alternator', 'gearbox8', 'gearbox9']);
assert.equal(certaintyLabels.clarified, 'Keterangan rekan proyek');
for (const [id, item, name] of [['motor3', '3', 'Motor 3'], ['gearbox4', '4', 'Gearbox 4'], ['gearbox5', '5', 'Gearbox 5'], ['motor6', '6', 'Motor 6'], ['alternator', '7', 'Alternator'], ['gearbox8', '8', 'Gearbox 8'], ['gearbox9', '9', 'Gearbox 9']]) {
  const e = equipmentDefinitions.find(e => e.id === id);
  assert.equal(e.item, item); assert.equal(e.name, name); assert.equal(e.certainty, 'clarified');
  assert.deepEqual(e.identitySources, ['project-colleague']); assert.ok(e.draftIdentity);
}
assert.equal(equipmentDefinitions.find(e => e.id === 'alternator').draftIdentity, 'Alternator (asumsi).');
assert.ok(!equipmentDefinitions.some(e => ['shaft36', 'shaft89'].includes(e.id)));
for (const d of devices) {
  assert.ok(data.instrumentsForEquipment(d.id, 'motor6')[0].tag.startsWith('DEMO:'));
  for (const tag of ['TT-03', 'VT-07', 'VT-401']) {
    const reading = readingsForInstrument(d, tag)[0];
    assert.equal(reading.quality, d.online ? 'simulated' : 'offline');
  }
  for (const id of ['gearbox4', 'gearbox5']) {
    const mapped = data.instrumentsForEquipment(d.id, id);
    assert.equal(mapped.length, 1); assert.equal(mapped[0].tag, 'VT-401'); assert.equal(mapped[0].deviceId, d.id);
  }
}
assert.equal(instrumentDefinitions.find(i => i.tag === 'TT-03').equipmentId, 'motor3');
assert.equal(instrumentDefinitions.find(i => i.tag === 'VT-07').equipmentId, 'alternator');
assert.equal(instrumentDefinitions.find(i => i.tag === 'ST-401').equipmentId, 'shaft-train');
for (const id of ['gearbox8', 'gearbox9']) {
  assert.ok(flowLinks.filter(l => l.from === id || l.to === id).every(l => l.certainty === 'tbd' && l.kind === 'mechanical'));
}
for (let i = 1; i < mainSequence.length; i++) assert.ok(flowLinks.some(l => l.from === mainSequence[i - 1] && l.to === mainSequence[i]));
assert.equal(new Set(equipment.map(e => e.instanceId)).size, equipment.length);
assert.equal(new Set(instruments.map(i => i.instanceId)).size, instruments.length);
const expectedMapping = { rpm: 'ST-401', voltage: 'PM-01', frequency: 'PM-01', motorTemperature: 'TT-02', roomTemperature: 'TT-303', bldcTemperature: 'TT-12' };
assert.equal(Object.keys(parameters).length, 6);
for (const [parameter, tag] of Object.entries(expectedMapping)) {
  assert.equal(parameters[parameter].tag, tag);
  assert.ok(instrumentDefinitions.find(i => i.tag === tag).parameters.includes(parameter));
}
for (const device of devices) {
  const scoped = instruments.filter(i => i.deviceId === device.id);
  assert.equal(scoped.length, instrumentDefinitions.length);
  for (const i of scoped) {
    assert.ok(equipment.some(e => e.deviceId === device.id && e.id === i.equipmentId));
    for (const reading of readingsForInstrument(device, i.tag)) {
      assert.equal(reading.deviceId, device.id);
      if (!device.online) { assert.equal(reading.value, null); assert.equal(reading.quality, 'offline'); }
      if (i.valueType === 'digital') assert.ok(reading.value === null || typeof reading.value === 'boolean');
    }
  }
  if (device.online) assert.ok(Number.isFinite(device.telemetry.bldcTemperature));
  assert.equal(readingsForInstrument(device, 'TT-12')[0].quality, device.online ? (device.telemetry.bldcTemperature === null ? 'not-simulated' : 'simulated') : 'offline');
}
assert.equal(readingsForInstrument(devices[0], 'TT-02')[0].value, 31);
assert.equal(readingsForInstrument(devices[1], 'TT-02')[0].value, 36);
assert.equal(readingsForInstrument(devices[0], 'TT-303')[0].value, 27);
for (const tag of ['LSL-19', 'LSL-20']) {
  const i = instrumentDefinitions.find(i => i.tag === tag);
  assert.equal(i.valueType, 'digital'); assert.equal(i.unit, undefined);
  assert.equal(readingsForInstrument(devices[0], tag)[0].value, false);
}
const at = instrumentDefinitions.find(i => i.tag === 'AT-301');
assert.equal(at.unit, undefined); assert.equal(at.certainty, 'tbd'); assert.equal(at.valueType, 'unresolved');
const tt07 = instrumentDefinitions.find(i => i.tag === 'TT-07');
assert.ok(tt07.function.includes('belitan dan bearing')); assert.deepEqual(tt07.parameters, []);
assert.equal(parameterQuality({ ...devices[0], telemetry: { ...devices[0].telemetry, rpm: null } }, 'rpm'), 'no-current-data');
assert.equal(parameterQuality(devices[2], 'rpm'), 'simulated');
const changedRpm = { ...devices[0], telemetry: { ...devices[0].telemetry, rpm: 777 } };
assert.equal(readingsForInstrument(changedRpm, 'PM-01')[1].value, 50, 'frequency must not derive from RPM');
assert.ok(trends['GEN-001'].some(s => Math.abs(s.frequency - s.rpm / 10) > 0.01));
for (const link of flowLinks) {
  assert.ok(['electrical', 'mechanical', 'belt', 'signal'].includes(link.kind));
  assert.ok(['documented', 'clarified', 'assumed', 'tbd'].includes(link.certainty));
  for (const id of [link.from, link.to]) assert.ok(equipmentDefinitions.some(e => e.id === id));
}
assert.ok(flowLinks.some(l => l.from === 'alternator' && l.to === 'breaker' && l.kind === 'electrical'));
assert.ok(flowLinks.some(l => l.from === 'breaker' && l.to === 'output'));
assert.ok(!flowLinks.some(l => ['gearbox8', 'gearbox9'].includes(l.from) && l.kind === 'electrical'));
assert.ok(!equipmentDefinitions.some(e => e.id === 'PM-01'), 'meter is not a power converter');
// M2: P-201 stays unmapped to any numbered item; subsystems are present; security/oil/ventilation instruments exist.
const pump = equipmentDefinitions.find(e => e.id === 'pump');
assert.equal(pump.item, 'P-201');
assert.ok(!mainSequence.includes('pump'));
assert.ok(pump.notes.includes('Lokasi fisik belum dikonfirmasi'));
for (const id of ['prt', 'estop', 'siren', 'gps', 'dongle', 'spd', 'hv201', 's201', 'cv201', 'f201', 'manifold15', 'lv301', 'f301', 'lv302']) assert.ok(equipmentDefinitions.some(e => e.id === id), id);
for (const tag of ['PV-01', 'PRT-01', 'TT-10', 'ST-10', 'PDT-201', 'TT-201', 'TT-301', 'TT-304', 'PDT-301', 'ES-01', 'SIR-01', 'GPS-01', 'DNG-01', 'SPD-01']) assert.ok(instrumentDefinitions.some(i => i.tag === tag), tag);
const es01 = instrumentDefinitions.find(i => i.tag === 'ES-01');
assert.equal(es01.valueType, 'digital');
assert.ok(es01.notes.includes('Hardwired, di luar logika PLC'));
// M2 Data: CSV escaping, ISO 8601 with zone, and null-as-empty-cell behavior.
const csvSource = await readFile(new URL('../src/lib/csv.ts', import.meta.url), 'utf8');
const csvJs = ts.transpileModule(csvSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const csv = await import(`data:text/javascript;base64,${Buffer.from(csvJs).toString('base64')}`);
assert.equal(csv.csvCell(null), '');
assert.equal(csv.csvCell('a,b'), '"a,b"');
assert.equal(csv.csvCell('a"b'), '"a""b"');
assert.equal(csv.csvCell('a\nb'), '"a\nb"');
assert.equal(csv.toCsv([[null, 'x'], ['a,b', 'c']]), ',x\n"a,b",c');
assert.equal(csv.isoWithZone(DEMO_NOW), '2026-11-04T14:00:00+07:00');
// Data page uses the same trends/parameters as gauge and chart (ST-401, PM-01, TT-02).
for (const p of ['rpm', 'voltage', 'frequency', 'motorTemperature']) assert.ok(['ST-401', 'PM-01', 'PM-01', 'TT-02'].includes(parameters[p].tag));
const { ventilationFanMocks, ventilationFanStatus, ventilationFanRotates } = data;
assert.deepEqual(devices.slice(0, 4).map(d => ventilationFanStatus(d)), ['running', 'running', 'stopped', 'offline']);
assert.deepEqual(devices.slice(0, 4).map(d => ventilationFanRotates(ventilationFanStatus(d))), [true, true, false, false]);
for (const status of ['stopped', 'offline', 'unknown', 'not-simulated']) assert.equal(ventilationFanRotates(status), false);
assert.equal(ventilationFanRotates('running', true), false, 'visual pause stops blades');
assert.equal(ventilationFanRotates('running', false), true, 'visual resume permits rotation');
assert.equal(ventilationFanStatus({ ...devices[0], status: 'standby' }), 'running', 'fan must not derive from genset standby');
assert.equal(ventilationFanStatus({ ...devices[2], status: 'running' }), 'stopped', 'fan must not derive from genset running');
assert.equal(ventilationFanStatus(devices[3], { ...ventilationFanMocks, 'GEN-004': 'running' }), 'offline', 'offline overrides stale running mock');
assert.equal(ventilationFanStatus(devices[0], { 'GEN-001': 'unknown' }), 'unknown');
assert.equal(ventilationFanStatus({ id: 'UNMAPPED', online: true }), 'not-simulated');
const illustration = await readFile(new URL('../src/components/overview/machine-illustration.tsx', import.meta.url), 'utf8');
assert.ok(!illustration.includes('ventilation-fan-blades'), 'overview must not render the removed fan animation');
assert.ok(!illustration.includes('Jeda animasi'), 'overview must not render the removed animation control');
assert.ok(!illustration.includes('xl:grid-cols-[minmax(0,1fr)_144px]'), 'diagram must not reserve a fan sidebar column');
assert.ok(illustration.includes("['ventilation', 'Ventilasi ruang']"), 'ventilation details remain accessible');
const { qualityLabels, ventilationFanStatusLabels } = data;
assert.equal(qualityLabels.simulated, 'Nilai terbaru');
assert.equal(qualityLabels['not-simulated'], 'Belum ada data');
assert.equal(qualityLabels['no-current-data'], 'Belum ada data terkini');
assert.equal(qualityLabels.offline, 'Offline');
assert.equal(ventilationFanStatusLabels['not-simulated'], 'Belum ada data');
assert.equal(ventilationFanStatusLabels.running, 'Berjalan (running)');
console.log('PASS: copy labels use neutral wording and keep design-status certainty labels unchanged.');
console.log('PASS: independent per-device M-301 mock, offline/unknown/stopped guards, rotation helpers, and removed overview fan panel checks.');
console.log('PASS: fleet/filter invariants, deterministic trends, device-scoped instruments, tag mapping, null/quality semantics, digital levels, unresolved units, independent RPM/Hz, and conceptual flow certainty.');

// Execute pure view selectors and schema validators against the same data module.
async function moduleFrom(path, replacements = {}) {
  let text = await readFile(new URL(path, import.meta.url), 'utf8');
  let js = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [from, to] of Object.entries(replacements)) js = js.replaceAll(from, to);
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
assert.ok(illustration.includes('equipmentLayout.map('), 'illustration retains the shared item registry');
assert.ok(illustration.includes('overviewConnections.map('), 'illustration retains the shared connections');
assert.ok(illustration.includes('connectionPath(connection)'), 'illustration retains the shared route builder');
const systemOverview = await readFile(new URL('../src/components/overview/system-overview.tsx', import.meta.url), 'utf8');
assert.ok(systemOverview.includes('<MachineIllustration {...views} showSupportingPanels={false} />'), 'Overview renders the illustration directly');
for (const removed of ['SystemDiagram', 'Diagram Sistem', 'role="tablist"', 'role="tabpanel"', 'system-tab-', 'setTab']) {
  assert.ok(!systemOverview.includes(removed), `Overview no longer includes ${removed}`);
}
assert.ok(systemOverview.includes('catalogMachine && <MachineDetailPanel'), 'catalog detail dialogs remain available');
assert.ok(systemOverview.includes('<EquipmentDetails selectedId={selectedId}'), 'equipment detail dialogs remain available');
assert.ok(systemOverview.includes('trigger.current?.focus()'), 'detail dialogs retain focus restoration');
assert.ok(systemOverview.includes('<OverviewViews key={device.id} />'), 'selection resets when the active device changes');
console.log('PASS: Overview shows only the machine illustration, without diagram tabs, and retains both detail dialog types.');
const statusModel = await moduleFrom('../src/lib/device-status.ts');
assert.deepEqual(devices.slice(0, 4).map(statusModel.deviceStatusKey), ['running', 'running', 'standby', 'offline']);
assert.deepEqual(devices.slice(0, 4).map(device => statusModel.deviceStatus(device).label), ['Running', 'Running', 'Standby', 'Offline']);
for (const status of ['running', 'standby', 'unknown']) assert.equal(statusModel.deviceStatusKey({ online: false, status }), 'offline');
assert.equal(statusModel.deviceStatus({ online: true, status: 'unknown' }).label, 'Tidak diketahui');
assert.ok(statusModel.deviceStatusDefinitions.standby.className.includes('amber'));
for (const [status, tokens] of Object.entries({
  running: ['bg-emerald-50', 'text-emerald-700', 'dark:bg-success-soft', 'dark:text-success'],
  standby: ['bg-amber-50', 'text-amber-700', 'dark:bg-warning-soft', 'dark:text-warning'],
  offline: ['bg-slate-100', 'text-slate-600', 'dark:bg-surface-hover', 'dark:text-muted'],
  unknown: ['bg-slate-100', 'text-slate-600', 'dark:bg-surface-hover', 'dark:text-muted'],
})) {
  assert.deepEqual(statusModel.deviceStatusDefinitions[status].className.split(' '), tokens, `${status}: retain light colors and apply semantic dark colors`);
}

assert.deepEqual([devices[2].telemetry.rpm, devices[2].telemetry.voltage, devices[2].telemetry.frequency], [0, 0, 0]);
assert.ok(alarms.some(alarm => alarm.deviceId === devices[1].id && alarm.severity === 'warning'), 'running and warning coexist');
const sharedStatusSource = await readFile(new URL('../src/components/shared.tsx', import.meta.url), 'utf8');
assert.ok(sharedStatusSource.includes('deviceStatus(device)') && sharedStatusSource.includes('Data demo'));
assert.ok(devicePage.includes('deviceStatus(device).label'));
assert.ok(overviewSource.includes('<StatusBadge device={device} animated />'));
assert.ok((await readFile(new URL('../src/pages/virtual.tsx', import.meta.url), 'utf8')).includes('<StatusBadge device={device} animated />'));
assert.ok(equipmentDetailSource.includes('Status belum tersedia') && equipmentDetailSource.includes('Posisi belum tersedia'));
for (const removed of ['ventilationFanStatus', 'Kecepatan animasi', 'Jeda/lanjut']) assert.ok(!equipmentDetailSource.includes(removed));
console.log('PASS: consistent running/standby/offline unit indicators, demo provenance, preserved telemetry/warnings and no mock ventilation status in dialogs.');
// Motion is opt-in for the selected unit and must never infer component operation.
for (const online of [false, true]) {
  for (const status of ['running', 'standby', 'unknown']) {
    for (const animated of [false, true]) {
      assert.equal(statusModel.shouldAnimateDeviceStatus({ online, status }, animated), online && status === 'running' && animated);
    }
    assert.equal(statusModel.shouldAnimateDeviceStatus({ online, status }), online && status === 'running', 'all running unit badges animate by default');
  }
}
assert.ok(sharedStatusSource.includes('animated = true') && sharedStatusSource.includes('shouldAnimateDeviceStatus(device, animated)'));
assert.ok(sharedStatusSource.includes('aria-hidden="true" className="relative inline-flex'));
for (const page of [overviewSource, devicePage, await readFile(new URL('../src/pages/virtual.tsx', import.meta.url), 'utf8')]) {
  assert.equal((page.match(/<StatusBadge device=\{device\} animated \/>/g) ?? []).length, 1, 'one animated selected-unit badge per page');
  assert.ok(!/<StatusBadge device=\{d\} animated/.test(page), 'list and card badges remain static');
}
const statusCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
assert.match(statusCss, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.unit-running-ring\s*\{\s*animation: unit-running-pulse 2s ease-out infinite;/);
assert.match(statusCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.unit-running-ring\s*\{\s*animation: none !important;/);
assert.ok(statusCss.includes('.unit-running-ring { opacity: 0; }'), 'reduced-motion keeps only the solid dot');
for (const path of ['../src/components/virtual/subsystems.tsx', '../src/components/virtual/subsystem-parts.tsx', '../src/components/overview/machine-illustration.tsx']) {
  const componentSource = await readFile(new URL(path, import.meta.url), 'utf8');
  assert.ok(!componentSource.includes('unit-running-ring') && !componentSource.includes('shouldAnimateDeviceStatus'), 'conceptual motion is independent of unit operation');
}
console.log('PASS: running pulse on all unit badges, offline/standby/unknown guards, independent component illustrations and reduced-motion override.');
const layout = await moduleFrom('../src/components/overview/equipment-layout.ts');
const layoutModuleUrl = `data:text/javascript;base64,${Buffer.from(ts.transpileModule(await readFile(new URL('../src/components/overview/equipment-layout.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`;
const subsystemModel = await moduleFrom('../src/components/virtual/subsystem-model.ts', { '@/components/overview/equipment-layout': layoutModuleUrl });
assert.deepEqual(subsystemModel.orderedItems(subsystemModel.shaftConnections), [2, 3, 4, 5, 6, 7, 8, 9]);
assert.deepEqual(subsystemModel.orderedItems(subsystemModel.draftCableConnections), [1, 12, 13, 14, 16]);
assert.deepEqual(subsystemModel.oilConnections.map(connection => [connection.from.item, connection.to.item]), [[19, 4], [19, 5], [20, 8], [20, 9]]);
assert.deepEqual(subsystemModel.pmgConnections.filter(connection => connection.style === 'belt').map(connection => connection.to.item), [10, 11]);
assert.ok(subsystemModel.pmgConnections.filter(connection => connection.style === 'belt').every(connection => !('item' in connection.from)));
assert.equal(subsystemModel.pmgConnections.filter(connection => connection.style === 'cable').length, 3);
assert.throws(() => subsystemModel.subsystemItem(18), /Missing subsystem item 18/);
const subsystemSource = await readFile(new URL('../src/components/virtual/subsystems.tsx', import.meta.url), 'utf8');
const subsystemParts = await readFile(new URL('../src/components/virtual/subsystem-parts.tsx', import.meta.url), 'utf8');
for (const removed of ['Lube PMG', 'Lube poros', 'Titik lube poros &amp; PMG → kembali ke tangki', 'Tangki → HV-201', 'label="PMG 10/11"']) assert.ok(!subsystemSource.includes(removed), `No unsupported legacy route: ${removed}`);
assert.ok(subsystemParts.includes('getOverviewDetailId(item)'), 'subsystem cards retain distinct catalog identities');
assert.ok(subsystemParts.includes('candidate.deviceId === device.id'), 'reference equipment is unit scoped');
assert.ok(subsystemParts.includes('instrument.deviceId === device.id'), 'instrument references are unit scoped');
assert.ok(subsystemParts.includes('<DialogTrigger asChild><button'), 'cards use native keyboard-accessible dialog triggers');
assert.ok(subsystemParts.includes('overflow-x-auto'), 'wide connection rows have scoped scrolling');
const ventilationSource = subsystemSource.slice(subsystemSource.indexOf('export function Ventilation'), subsystemSource.indexOf('export function Security'));
for (const removed of ['ventilationFanStatus', 'ventilationFanRotates', 'ventilationFanStatusLabels', 'Jeda animasi', 'Lanjutkan animasi', 'animationPlayState', 'FanBlades']) assert.ok(!subsystemSource.includes(removed), `Virtual has no simulated ventilation operation: ${removed}`);
assert.ok(ventilationSource.includes('Skematik sistem · bukan kondisi aktual perangkat'));
assert.ok(ventilationSource.includes('Status belum tersedia'));
assert.ok(ventilationSource.includes('Posisi belum tersedia'));
assert.ok(ventilationSource.includes('label="Kipas ventilasi" sub="M-301"'));
assert.ok(ventilationSource.includes('label="Damper" sub="DMP-301"'));
assert.equal((ventilationSource.match(/id="ventilation"/g) ?? []).length, 3, 'fan, damper and room retain existing shared detail identity');
assert.ok(!ventilationSource.includes('useDemo'), 'schematic does not derive running from unit state');
assert.ok(!ventilationSource.includes('useState'), 'no animation control state');
assert.ok(!(await readFile(new URL('../src/index.css', import.meta.url), 'utf8')).includes('ventilation-fan-'), 'unused fan animation styles removed');
assert.ok(subsystemSource.includes("device.online ? 'Belum ada data' : 'Offline · Belum ada data terkini'"), 'security does not infer healthy status');
assert.ok(subsystemSource.includes('LSL-19/20 adalah status digital low-level, bukan persentase'));
assert.ok(subsystemSource.includes('RH atau titik embun belum ditetapkan'));
console.log('PASS: shared subsystem routes, separate PMG identities, no invented lube returns, unit-scoped references, accessible cards, and static ventilation without mock operating status.');
const virtualSource = await readFile(new URL('../src/pages/virtual.tsx', import.meta.url), 'utf8');
assert.ok(navigationSource.includes("{ path: '/virtual', label: 'Visualisasi',"), 'navigation renamed without changing the route');
assert.ok(virtualSource.includes('>Visualisasi Sistem</h1>'));
assert.ok(virtualSource.includes('Diagram sistem dan subsistem per unit · Ilustrasi konseptual'));
assert.ok(!navigationSource.includes("label: 'Virtual'") && !virtualSource.includes('>Virtual</h1>'));
console.log('PASS: Visualisasi navigation, Visualisasi Sistem heading and conceptual description retain the /virtual route.');
assert.ok(virtualSource.includes("{ id: 'complete', label: 'Sistem lengkap', Component: MachineIllustration }"));
assert.ok(virtualSource.indexOf("id: 'complete'") < virtualSource.indexOf("id: 'driver'"));
for (const id of ['driver', 'oil', 'vent', 'security']) assert.ok(virtualSource.includes(`id: '${id}'`));
assert.ok(virtualSource.includes('useState(0)'), 'complete system is the default tab');
assert.ok(virtualSource.includes('<VirtualUnit key={device.id} />'), 'unit changes remount selection, dialog and tab state');
assert.ok(virtualSource.includes('catalogMachine && <MachineDetailPanel'));
assert.ok(virtualSource.includes("!selectedId.startsWith('catalog-item-') && <EquipmentDetails"));
assert.ok(virtualSource.includes('virtualTabIndex(tab, e.key, subsystems.length)'), 'keyboard navigation uses the actual tab count');
assert.ok(virtualSource.includes('Mode baca saja') && !virtualSource.includes('<Button'), 'Virtual has no remote-control buttons');
assert.ok(illustration.includes('getOverviewDetailId(item)'), 'illustration uses shared detail identities');
for (const item of [10, 11, 14, 16]) assert.equal(layout.getOverviewDetailId(item), `catalog-item-${item}`);
assert.equal(layout.getOverviewDetailId(2), 'motor');
const virtualNavigation = await moduleFrom('../src/components/virtual/navigation.ts');
for (const count of [1, 4, 5, 6]) {
  for (let index = 0; index < count; index++) {
    assert.equal(virtualNavigation.virtualTabIndex(index, 'Home', count), 0);
    assert.equal(virtualNavigation.virtualTabIndex(index, 'End', count), count - 1);
    assert.equal(virtualNavigation.virtualTabIndex(index, 'ArrowRight', count), (index + 1) % count);
    assert.equal(virtualNavigation.virtualTabIndex(index, 'ArrowLeft', count), (index + count - 1) % count);
    assert.equal(virtualNavigation.virtualTabIndex(index, 'Escape', count), index);
  }
}
console.log('PASS: Virtual complete-system default, retained subsystems, unit-scoped state, catalog details and dynamic keyboard navigation.');

const layoutSource = await readFile(new URL('../src/components/overview/equipment-layout.ts', import.meta.url), 'utf8');
const layoutJs = ts.transpileModule(layoutSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const layoutUrl = `data:text/javascript;base64,${Buffer.from(layoutJs).toString('base64')}`;
const routes = await moduleFrom('../src/components/overview/equipment-connections.ts', { "'./equipment-layout'": JSON.stringify(layoutUrl) });
for (const connection of layout.overviewConnections) {
  const path = routes.connectionPath(connection);
  assert.ok(path.startsWith('M ') && !/NaN|undefined/.test(path), `valid shared route ${connection.id}`);
}
assert.equal(layout.overviewConnections.length, 20);
assert.equal(new Set(layout.equipmentLayout.map(entry => entry.item)).size, 19);
const node = item => layout.equipmentLayout.find(entry => entry.item === item);
assert.equal(node(2).label, 'Motor AC');
assert.equal(equipmentDefinitions.find(entry => entry.id === 'motor').name, 'Motor AC 2');
assert.equal(instrumentDefinitions.find(entry => entry.tag === 'TT-02').equipmentId, 'motor');
const machineCatalog = JSON.parse(await readFile(new URL('../src/data/machines.json', import.meta.url), 'utf8'));
assert.equal(machineCatalog.find(entry => entry.item === 2).name, 'Motor AC');
for (const item of [3, 6]) assert.equal(node(item).label, 'Motor', 'AC identification only applies to item 2');
for (const connection of layout.overviewConnections.filter(entry => entry.style === 'shaft')) {
  const from = node(connection.from.item);
  const to = node(connection.to.item);
  assert.equal(from.anchors.right.y, to.anchors.left.y, 'shaft endpoints share one centreline');
  assert.ok(to.x - from.x - from.width >= 24, 'shaft equipment has a consistent minimum gap');
}
for (const group of [[2, 3, 6], [4, 5, 8, 9], [10, 11], [19, 20]]) {
  assert.equal(new Set(group.map(item => `${node(item).width}x${node(item).height}`)).size, 1, 'same equipment classes have matching sizes');
}
const boxes = layout.equipmentLayout.map(entry => ({
  item: entry.item,
  x: entry.x - (Math.max(entry.labelWidth, entry.width) - entry.width) / 2 - 5,
  y: entry.y - 8,
  width: Math.max(entry.labelWidth, entry.width) + 10,
  height: entry.height + 32,
}));
for (const [index, box] of boxes.entries()) {
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= layout.overviewViewBox.width && box.y + box.height < layout.overviewBounds.legend.y, `item ${box.item} including label stays within diagram`);
  for (const other of boxes.slice(index + 1)) {
    const overlap = box.x < other.x + other.width && box.x + box.width > other.x && box.y < other.y + other.height && box.y + box.height > other.y;
    assert.ok(!overlap, `equipment and label boxes ${box.item}/${other.item} must not overlap`);
  }
}
const { container, roof, equipment: equipmentArea, legend, outputArea } = layout.overviewBounds;
for (const area of [roof, equipmentArea]) {
  assert.equal(area.x - container.x, 24, 'inner areas have a consistent left gutter');
  assert.ok(area.y - container.y >= 24, 'inner areas have top breathing room');
}
assert.equal(container.x + container.width - equipmentArea.x - equipmentArea.width, 24, 'equipment right gutter matches the left');
assert.equal(container.y + container.height - equipmentArea.y - equipmentArea.height, 24, 'equipment bottom gutter matches the sides');
assert.equal(equipmentArea.y - roof.y - roof.height, 24, 'roof and equipment areas remain separated');
assert.equal(legend.y - container.y - container.height, 24, 'legend remains separated from the white frame');
assert.ok(legend.y + legend.height <= layout.overviewViewBox.height - 14);
for (const box of boxes) {
  const area = box.item === 1 ? roof : box.item === 17 ? outputArea : equipmentArea;
  assert.ok(box.x >= area.x && box.x + box.width <= area.x + area.width, `item ${box.item} stays inside its area horizontally`);
  const bottomPadding = area === roof ? 8 : 24;
  assert.ok(box.y >= area.y && box.y + box.height <= area.y + area.height - bottomPadding, `item ${box.item} has bottom label clearance`);
  if (area === equipmentArea) assert.ok(box.y >= area.y + 44, `item ${box.item} clears the area heading`);
}
assert.ok(illustration.includes('overviewBounds.equipment.y + 28'), 'equipment heading follows its own area');
const routeSource = await readFile(new URL('../src/components/overview/equipment-connections.ts', import.meta.url), 'utf8');
assert.ok(routeSource.includes('corridor.lubricationY'), 'oil routes follow the shifted equipment');
console.log('PASS: balanced frame gutters, separated areas and legend, heading clearance and bottom label padding.');
const oilConnections = layout.overviewConnections.filter(entry => entry.style === 'lubrication');
assert.deepEqual(oilConnections.map(entry => [entry.from.item, entry.to.item]), [[19, 4], [19, 5], [20, 8], [20, 9]], 'each tank supplies exactly its confirmed gearbox pair directly');
for (const connection of oilConnections) {
  assert.equal(connection.from.anchor, 'top');
  assert.equal(connection.to.anchor, 'bottom');
  assert.equal(connection.certainty, 'functional mapping clarified; physical route TBD');
  assert.ok(node(connection.from.item).y > node(connection.to.item).y + node(connection.to.item).height);
}
assert.ok(equipmentDefinitions.find(entry => entry.id === 'oil19').function.includes('gearbox 4 dan 5'));
assert.ok(equipmentDefinitions.find(entry => entry.id === 'oil20').function.includes('gearbox 8 dan 9'));
assert.ok(illustration.includes('Garis bukan indikator aliran aktual.'));
assert.deepEqual(layout.overviewConnections.filter(entry => entry.id.includes('-branch')).map(entry => entry.from.item), [10, 11]);
assert.ok(layout.overviewConnections.every(entry => entry.certainty !== 'verified'), 'presentation adjustments do not assert physical verification');
console.log('PASS: aligned shafts, consistent equipment sizes, non-overlapping labels, diagram bounds and conceptual connections.');
const dataUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
const q = await moduleFrom('../src/data/queries.ts', { "'./demo'": JSON.stringify(dataUrl) });
assert.ok(q.filterDevices('site-a', '', 'running').every(d => d.siteId === 'site-a' && d.status === 'running'));
assert.deepEqual(q.filterDevices('all', 'gen-004', 'offline').map(d => d.id), ['GEN-004']);
assert.equal(q.filterDevices('site-a', '', 'offline').length, 0);
assert.equal(q.filterDevices('all', 'missing').length, 0);
for (const hours of [1, 6, 24, 168]) {
  const rows = q.telemetryRows(devices, hours);
  assert.equal(rows.length, devices.length * 6 * (hours * 12 + 1));
  assert.ok(rows.filter(r => r.unit === 'GEN-004').every(r => r.value === null && r.quality === 'no-current-data'));
  for (const d of devices) for (const p of q.trendParameters) {
    const latest = rows.filter(r => r.unit === d.id && r.parameter === p).at(-1);
    assert.equal(latest.value, d.telemetry[p]);
    assert.equal(latest.tag, parameters[p].tag);
    const series = q.chartSeries(d, p, hours);
    assert.equal(series.at(-1).time, DEMO_NOW);
    assert.equal(series.length, hours < 24 ? hours * 12 + 1 : hours === 24 ? 24 : 7);
    if (d.id === 'GEN-004') assert.ok(series.every(r => r.value === null));
  }
}
const history = await moduleFrom('../src/data/history.ts', { "'./demo'": JSON.stringify(dataUrl) });
assert.equal(history.historyParameters.length, 6);
assert.equal(history.historySeries('GEN-001', 'voltage', '1H').length, 13);
assert.equal(history.historySeries('GEN-001', 'voltage', 'ALL').length, trends['GEN-001'].length);
assert.ok(history.historySeries('GEN-001', 'roomTemperature', '6H').some(p => p.value !== null));
assert.ok(history.historySeries('GEN-001', 'bldcTemperature', '6H').some(p => p.value !== null));
assert.deepEqual(history.historySeries('GEN-001', 'voltage', '6H'), history.historySeries(devices[0].id, 'voltage', '6H'));
const savedOnline = devices[0].online;
devices[0].online = false;
assert.ok(history.historySeries(devices[0].id, 'voltage', '6H').some(p => p.value !== null));
devices[0].online = savedOnline;
assert.deepEqual(history.historyStats([{ time: '', value: 0 }, { time: '', value: null }, { time: '', value: 10 }]), { count: 2, min: 0, max: 10, average: 5 });
assert.deepEqual(history.historyStats([]), { count: 0, min: null, max: null, average: null });
assert.deepEqual(history.historySeries('unknown', 'rpm', 'ALL'), []);
const historyUi = await readFile(new URL('../src/components/history-chart.tsx', import.meta.url), 'utf8');
assert.ok(historyUi.includes('type="linear"') && historyUi.includes('connectNulls={false}') && historyUi.includes('<Brush'));
const chartPage = await readFile(new URL('../src/pages/chart-widget.tsx', import.meta.url), 'utf8');
assert.ok(chartPage.includes('historyParameters.map') && chartPage.includes('Semua tersedia'));
console.log('PASS: Historical raw ranges, six parameter coverage, missing channels, retained offline archive, null-safe statistics and linear brush charts.');
const hourly = q.chartSeries(devices[0], 'voltage', 24);
const firstGroup = trends['GEN-001'].slice(-288).slice(0, 12);
assert.equal(hourly[0].value, Number((firstGroup.reduce((sum, r) => sum + r.voltage, 0) / 12).toFixed(2)));
const validators = await moduleFrom('../src/lib/validation.ts', { "'@/data/demo'": JSON.stringify(dataUrl) });
assert.ok(validators.isWidgetArray([{ id: 'w1', deviceId: 'GEN-001', parameter: 'voltage', title: 'Output' }]));
for (const parameter of ['LSL-19', 'garbage', '__proto__']) assert.equal(validators.isWidgetArray([{ id: 'w1', deviceId: 'GEN-001', parameter, title: 'x' }]), false);
assert.equal(validators.isWidgetArray([{ id: 'w', deviceId: 'GEN-999', parameter: 'rpm', title: 'x' }]), false);
assert.ok(validators.isTicketArray(data.seedTickets));
assert.equal(validators.isTicketArray([{ id: 'broken', title: 'x', description: 'y' }]), false);
const memory = new Map();
globalThis.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k), key: i => [...memory.keys()][i] ?? null, get length() { return memory.size; } };
const targetModel = await moduleFrom('../src/lib/gauge-targets.ts', { "'@/data/demo'": JSON.stringify(dataUrl) });
const { emptyTargets, isTargetStore, isTarget, applyTarget, targetDefinitions } = targetModel;
const now = '2026-11-07T00:00:00.000Z';
assert.ok(isTargetStore(emptyTargets()));
for (const parameter of Object.keys(targetDefinitions)) {
  const { min, max, step } = targetDefinitions[parameter];
  assert.ok(isTarget(parameter, min));
  assert.ok(isTarget(parameter, max));
  for (const value of [NaN, Infinity, null, '26', min - step, max + step, step / 2]) assert.equal(isTarget(parameter, value), false);
  const original = emptyTargets();
  const updated = applyTarget(original, 'GEN-001', true, parameter, max, now);
  assert.ok(isTargetStore(updated));
  assert.equal(updated.settings['GEN-001'][parameter], max);
  assert.equal(updated.settings['GEN-002'], undefined);
  assert.equal(updated.history[0].before, null);
  assert.equal(updated.history[0].parameter, parameter);
  assert.deepEqual(original, emptyTargets());
  assert.equal(applyTarget(updated, 'GEN-001', true, parameter, max, now), null);
  assert.equal(applyTarget(original, 'GEN-004', false, parameter, max, now), null);
  assert.equal(applyTarget(original, 'GEN-999', true, parameter, max, now), null);
  assert.equal(applyTarget(original, 'GEN-001', true, parameter, max, 'bad'), null);
}
for (const parameter of ['__proto__', 'garbage']) assert.equal(isTarget(parameter, 1), false);
assert.equal(isTargetStore({ settings: { 'GEN-999': { rpm: 1 } }, history: [] }), false);
assert.equal(isTargetStore({ settings: { 'GEN-001': { rpm: '1' } }, history: [] }), false);
assert.equal(isTargetStore({ settings: {}, history: [{}] }), false);
let targets = emptyTargets();
for (let i = 0; i < 105; i++) targets = applyTarget(targets, 'GEN-001', true, 'rpm', i, now);
assert.equal(targets.history.length, 100);
targets = applyTarget(targets, 'GEN-001', true, 'frequency', 49.9, now);
assert.equal(targets.settings['GEN-001'].rpm, 104);
assert.equal(targets.settings['GEN-001'].frequency, 49.9);
const controlUi = await readFile(new URL('../src/components/gauge-target-control.tsx', import.meta.url), 'utf8');
const controlContext = await readFile(new URL('../src/context/demo-context.tsx', import.meta.url), 'utf8');
const gaugeUi = await readFile(new URL('../src/components/overview/gauge.tsx', import.meta.url), 'utf8');
const settingsUi = await readFile(new URL('../src/pages/gauge-widget.tsx', import.meta.url), 'utf8');
assert.ok(controlUi.includes('key={`${siteId}:${selectedDevice.id}:${device.id}:${parameter}`}'));
assert.ok(controlContext.includes('if (!targetDevice || !ids.has(id)) return false;'));
assert.ok(controlUi.includes('disabled={!device.online}'));
assert.ok(controlUi.includes('controlCopy.apply') && controlUi.includes('setConfirming(true)'));
assert.ok(gaugeUi.includes('<GaugeTargetControl device={device} parameter={parameter} measured={value} />'));
assert.ok(overviewSource.includes('equipment={item} device={device} visibleTags={tags} compact'));
assert.ok(!overviewSource.includes('DemoControls'));
assert.ok(settingsUi.includes('device={d} parameter={w.parameter}'));
assert.ok(!settingsUi.includes('NUMERIC_PARAMS.map(p => <GaugeCard'), 'settings must not duplicate the equipment gauges in a standalone panel');
assert.ok(settingsUi.includes('selectDevice(e.target.value)') && settingsUi.includes('{controlCopy.disclaimer}'), 'keep unit selection and local-only disclosure');
for (const source of [controlUi, controlContext]) assert.ok(!/fetch\(|WebSocket|XMLHttpRequest|telemetry\s*=/.test(source));
assert.ok(navigationSource.includes("label: 'Pengaturan Perangkat'"));
console.log('PASS: All six per-gauge targets, numeric validation, offline guards, unit/parameter isolation, bounded history and confirmation reset.');
const equipmentSource = await readFile(new URL('../src/lib/equipment-settings.ts', import.meta.url), 'utf8');
const equipmentJs = ts.transpileModule(equipmentSource.replace("import { equipmentDefinitions, devices } from '@/data/demo';", `const equipmentDefinitions = ${JSON.stringify(equipmentDefinitions)}; const devices = ${JSON.stringify(devices)};`), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const scenarioModel = await import(`data:text/javascript;base64,${Buffer.from(equipmentJs).toString('base64')}`);
const { equipmentScenarios, equipmentParameters, emptyEquipmentSettings, isEquipmentStore, applyEquipmentScenario, isScenario } = scenarioModel;
assert.deepEqual(Object.keys(equipmentScenarios).sort(), equipmentDefinitions.map(e => e.id).sort());
const telemetryBefore = JSON.stringify(devices);
for (const e of equipmentDefinitions) {
  const original = emptyEquipmentSettings();
  const option = equipmentScenarios[e.id].options[0];
  const updated = applyEquipmentScenario(original, 'GEN-001', true, e.id, option, now);
  assert.ok(isEquipmentStore(updated));
  assert.equal(updated.settings['GEN-001'][e.id], option);
  assert.deepEqual(original, emptyEquipmentSettings());
  assert.equal(updated.settings['GEN-002'], undefined);
  assert.equal(Object.keys(updated.settings['GEN-001']).length, 1);
  assert.equal(updated.history[0].before, null);
  assert.equal(applyEquipmentScenario(updated, 'GEN-001', true, e.id, option, now), null);
  assert.equal(applyEquipmentScenario(original, 'GEN-004', false, e.id, option, now), null);
  assert.equal(applyEquipmentScenario(original, 'GEN-999', true, e.id, option, now), null);
  assert.equal(applyEquipmentScenario(original, 'GEN-001', true, e.id, 'invalid', now), null);
  assert.equal(applyEquipmentScenario(original, 'GEN-001', true, e.id, option, 'invalid'), null);
}
for (const id of ['__proto__', 'constructor', 'unknown']) assert.equal(isScenario(id, 'Normal'), false);
assert.equal(isEquipmentStore({ settings: {}, history: [{}] }), false);
assert.equal(isEquipmentStore({ settings: { 'GEN-001': { pv: 'invalid' } }, history: [] }), false);
let scenarios = emptyEquipmentSettings();
for (let i = 0; i < 105; i++) scenarios = applyEquipmentScenario(scenarios, 'GEN-001', true, 'pv', equipmentScenarios.pv.options[i % 2], now);
assert.equal(scenarios.history.length, 100);
assert.equal(JSON.stringify(devices), telemetryBefore);
assert.deepEqual(Object.values(equipmentParameters).flat().sort(), Object.keys(targetDefinitions).sort(), 'all six numeric parameters remain available in equipment widgets without duplication');
for (const id of Object.keys(equipmentParameters)) assert.ok(equipmentDefinitions.some(e => e.id === id));
assert.deepEqual(equipmentParameters['shaft-train'], ['rpm']);
assert.equal(equipmentParameters.gearbox4, undefined);
const equipmentUi = await readFile(new URL('../src/components/equipment-widget.tsx', import.meta.url), 'utf8');
assert.ok(settingsUi.includes('visibleTags={visibleTags}'));
for (const section of ['equipment', 'widgets', 'history']) {
  assert.ok(settingsUi.includes(`id="settings-panel-${section}"`));
  assert.ok(settingsUi.includes(`aria-labelledby="settings-tab-${section}"`));
  assert.ok(settingsUi.includes(`hidden={tab !== '${section}'}`));
}
assert.ok(settingsUi.includes('role="tablist"') && settingsUi.includes('tabIndex={tab === value ? 0 : -1}'));
assert.ok(settingsUi.includes("['ArrowLeft', 'ArrowRight', 'Home', 'End']"));
assert.ok(settingsUi.includes('instrumentsForEquipment(device.id, e.id)') && settingsUi.includes('.includes(query)'));
assert.ok(settingsUi.includes('matchingEquipment.length === 0') && settingsUi.includes('type="search"'));
assert.ok(equipmentUi.includes('<DialogTrigger asChild>') && equipmentUi.includes('Detail instrumen') && !equipmentUi.includes('Atur skenario'));
console.log('PASS: settings subtabs, keyboard navigation, unit-scoped tag search, empty results and compact instrument details.');
assert.ok(equipmentUi.includes('key={`${siteId}:${device.id}:${instrument.tag}:'));
assert.ok(equipmentUi.includes('<DialogTitle') && !equipmentUi.includes('updateEquipmentScenario'));
assert.ok(equipmentUi.includes('<GaugeDial') && equipmentUi.includes('<GaugeTargetControl') && equipmentUi.includes('<ChannelTargetControl'));
assert.ok(!equipmentUi.includes('equipmentSettings') && !equipmentUi.includes('equipmentScenarios'));
assert.ok(!equipmentUi.includes('definition.label') && !equipmentUi.includes('Skenario lokal, bukan pengukuran atau kontrol fisik.'));
assert.ok(equipmentUi.includes('Status komponen aktual:'));
assert.ok(settingsUi.includes('equipmentSettings.history.filter(h => h.deviceId === device.id)'));
console.log('PASS: scenario condition panel removed; manual channel controls, actual status and legacy scenario history retained.');
assert.ok(!/fetch\(|WebSocket|XMLHttpRequest|telemetry\s*=/.test(equipmentUi));
console.log('PASS: Complete equipment widget coverage, scenario validation, immutable isolated settings, offline guards, bounded history and unchanged telemetry.');
const capabilityModel = await moduleFrom('../src/lib/equipment-capabilities.ts', { "'@/data/demo'": JSON.stringify(dataUrl) });
const { equipmentCapabilities, capabilityStatus, capabilityVisual } = capabilityModel;
for (const value of [0, 50, 100, 150, -10, true, false]) {
  const visual = capabilityVisual({ value, quality: 'simulated', max: 100 });
  assert.equal(visual.available, true, 'zero and false are available readings');
  assert.equal(visual.color, '#2563eb');
  assert.equal(visual.fraction, typeof value === 'number' ? Math.max(0, Math.min(1, value / 100)) : 0);
}
for (const reading of [{ value: null, quality: 'simulated' }, { value: 50, quality: 'offline' }, { value: 50, quality: 'missing' }]) {
  assert.deepEqual(capabilityVisual(reading), { available: false, fraction: 0, color: '#94a3b8' });
}
const dialUi = await readFile(new URL('../src/components/overview/gauge-dial.tsx', import.meta.url), 'utf8');
assert.ok(dialUi.includes('viewBox="0 0 220 145"') && dialUi.includes('fraction * 100'));
assert.ok(settingsUi.includes('seenTags.has(instrument.tag)') && settingsUi.includes('seenTags.add(instrument.tag)'));
assert.ok(equipmentUi.includes('visibleTags.includes(instrument.tag)') && equipmentUi.includes('reading.assumption'));
for (const unit of devices) {
  const tags = new Set();
  const cards = [];
  for (const item of equipmentDefinitions) {
    for (const { instrument, readings } of equipmentCapabilities(unit, item.id)) {
      if (tags.has(instrument.tag)) continue;
      tags.add(instrument.tag);
      cards.push(...readings.map(r => `${instrument.tag}:${r.channel ?? r.parameter}`));
    }
  }
  assert.equal(cards.length, new Set(cards).size, 'one card per shared channel');
  assert.ok(cards.some(key => key.startsWith('VT-401:')));
}
console.log('PASS: shared gauge dial, detail dialog, responsive channel cards and shared-channel deduplication.');
assert.ok(equipmentUi.includes('<ChannelReading reading={reading}') && equipmentUi.includes("kind === 'temperature' || kind === 'speed'"));
for (const unit of devices) {
  for (const instrument of instruments.filter(i => i.deviceId === unit.id)) {
    for (const reading of readingsForInstrument(unit, instrument.tag)) {
      const expectedDigital = instrument.valueType === 'digital' || typeof reading.value === 'boolean' || (data.demoChannels[instrument.tag] ?? []).some(c => c.id === reading.channel && typeof c.normal === 'boolean');
      assert.equal(capabilityModel.isDigitalReading(reading, instrument.valueType), expectedDigital);
      if (expectedDigital) assert.equal(capabilityModel.isDigitalReading({ ...reading, value: null, quality: 'offline' }, instrument.valueType), true);
    }
  }
}
console.log('PASS: shared cross-tab indicator classification including unresolved offline boolean channels.');
const dashboardModel = await moduleFrom('../src/lib/equipment-dashboard.ts');
const { dashboardTagGroups, equipmentDashboardGroup } = dashboardModel;
assert.equal(equipmentDashboardGroup('PM-01'), 'electrical');
assert.equal(equipmentDashboardGroup('LSL-19'), 'oil');
assert.equal(equipmentDashboardGroup('DMP-301'), 'air');
assert.equal(equipmentDashboardGroup('unmapped-tag'), 'status');
assert.deepEqual(dashboardTagGroups([]), []);
const dashboardJs = ts.transpileModule(await readFile(new URL('../src/lib/equipment-dashboard.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const overviewModel = await moduleFrom('../src/lib/overview-dashboard.ts', {
  "'@/data/demo'": JSON.stringify(dataUrl),
  "'@/lib/equipment-dashboard'": JSON.stringify(`data:text/javascript;base64,${Buffer.from(dashboardJs).toString('base64')}`),
});
for (const unit of devices) {
  const groups = overviewModel.overviewEquipmentGroups(unit);
  const tags = groups.flatMap(group => group.cards.flatMap(card => card.tags));
  const expected = data.instruments.filter(instrument => instrument.deviceId === unit.id).map(instrument => instrument.tag);
  assert.deepEqual([...tags].sort(), [...expected].sort(), 'Overview retains each registry tag exactly once');
  assert.equal(tags.length, new Set(tags).size);
  assert.equal(groups.reduce((sum, group) => sum + group.count, 0), 45);
  assert.ok(groups.every(group => group.cards.every(card => card.item.deviceId === unit.id)));
}
console.log('PASS: Overview selector covers all 45 readings per unit, deduplicates shared tags and isolates equipment instances.');
for (const unit of devices) {
  const tags = [...new Set(data.instruments.filter(i => i.deviceId === unit.id).map(i => i.tag))];
  const groupedTags = dashboardTagGroups(tags).flatMap(group => group.tags);
  assert.deepEqual([...groupedTags].sort(), [...tags].sort(), 'dashboard must retain every tag exactly once');
  assert.equal(groupedTags.length, new Set(groupedTags).size);
}
assert.ok(settingsUi.includes('<TrendChart key={device.id}') && settingsUi.includes('<CameraPreview'));
assert.ok(settingsUi.includes('visibleTags.filter(tag => group.tags.includes(tag))'));
assert.ok(equipmentUi.includes('Detail / Atur') && equipmentUi.includes('max-w-[170px]'));
console.log('PASS: grouped equipment dashboard covers all unit tags once, retains unknown tags, compact gauges, digital states, trend and media.');
for (const unit of devices) {
  const coveredTags = new Set();
  for (const item of equipmentDefinitions) {
    const capabilities = equipmentCapabilities(unit, item.id);
    const expected = data.instrumentsForEquipment(unit.id, item.id);
    assert.deepEqual(capabilities.map(c => c.instrument.tag), expected.map(i => i.tag));
    for (const { instrument, readings } of capabilities) {
      coveredTags.add(instrument.tag);
      assert.equal(instrument.deviceId, unit.id);
      assert.deepEqual(readings, readingsForInstrument(unit, instrument.tag));
      assert.ok(readings.length > 0);
      for (const reading of readings) {
        assert.equal(reading.deviceId, unit.id);
        if (!unit.online) assert.equal(capabilityStatus(reading), 'Unit offline');
        else if (reading.value === null) assert.equal(capabilityStatus(reading), 'Belum ada data');
        if (unit.online) assert.notEqual(reading.value, null, 'every online capability has explicit demo data');
      }
    }
  }
  assert.deepEqual([...coveredTags].sort(), instrumentDefinitions.map(i => i.tag).sort(), 'every instrument gets an automatic widget on every unit');
  assert.equal(equipmentCapabilities(unit, 'motor3')[0].instrument.tag, 'TT-03');
  assert.equal(equipmentCapabilities(unit, 'gearbox4')[0].instrument.tag, 'VT-401');
  assert.equal(equipmentCapabilities(unit, 'gearbox5')[0].instrument.tag, 'VT-401');
  assert.ok(equipmentCapabilities(unit, 'motor6')[0].instrument.tag.startsWith('DEMO:'));
}
for (const [value, expected] of [[true, 'Level rendah'], [false, 'Tidak rendah']]) {
  assert.equal(capabilityStatus({ deviceId: devices[0].id, tag: 'LSL-19', value, quality: 'simulated' }), expected);
}
const transitionRows = [0, 0, 1, 0, 0, null, null, 1, 1].map((value, index) => ({ time: String(index), value }));
assert.deepEqual(history.digitalHistoryIndices(transitionRows), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.deepEqual(history.digitalHistoryIndices([]), []);
assert.deepEqual(history.digitalHistoryIndices(Array.from({ length: 1000 }, (_, i) => ({ time: String(i), value: 0 }))), [0, 999]);
for (const [channel, active, inactive, attention] of [
  ['running', 'Berjalan', 'Berhenti', false], ['closed', 'Tertutup', 'Terbuka', false],
  ['trip', 'Trip aktif', 'Trip tidak aktif', true], ['pressed', 'Ditekan', 'Tidak ditekan', true],
]) {
  assert.equal(capabilityModel.digitalStatus('TEST', channel, true), active);
  assert.equal(capabilityModel.digitalStatus('TEST', channel, false), inactive);
  const reading = { tag: 'TEST', channel, value: true, quality: 'simulated' };
  assert.equal(capabilityModel.digitalAttention(reading), attention);
  assert.equal(capabilityModel.digitalAttention({ ...reading, quality: 'offline' }), false);
}
assert.ok(overviewHistorySource.includes('digitalHistoryIndices(rows)'));
assert.ok(overviewHistorySource.includes('color={historyColors[parameter]}'));
console.log('PASS: semantic digital labels, attention signals, transition/gap preservation and consistent analog colors.');
assert.ok(equipmentUi.includes('capabilities.length === 0') && equipmentUi.includes('Kondisi / kemampuan perangkat'));
assert.ok(equipmentUi.includes("instrument.valueType === 'analog'") && equipmentUi.includes('Indikator digital'));
assert.ok(equipmentUi.includes('reading.assumption'));
assert.ok(!equipmentUi.includes('setWidgets') && !equipmentUi.includes('widgets.length'), 'automatic widgets do not consume custom quota');
assert.ok(settingsUi.includes('Gauge kustom') && settingsUi.includes('widget bawaan perangkat tidak dihitung'));
console.log('PASS: Automatic capability widgets cover every instrument on 4 units; shared gearbox scope, missing/offline readings, digital indicators and custom quota isolation.');
const storage = await moduleFrom('../src/lib/storage.ts');
const migration = await moduleFrom('../src/lib/dataset-migration.ts', { "'@/data/demo'": JSON.stringify(dataUrl), "'./storage'": JSON.stringify(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(await readFile(new URL('../src/lib/storage.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`) });
storage.saveJSON('gauge-targets', { settings: { 'GEN-001': { rpm: 510 }, 'GEN-020': { rpm: 520 } }, history: [] });
storage.saveJSON('site', 'site-e'); storage.saveJSON('selected-unit', 'GEN-020');
storage.saveJSON('tickets', [data.seedTickets[0], { ...data.seedTickets[0], id: 'retired', unit: 'GEN-020' }]);
memory.set('other-app', 'preserve');
migration.migrateDatasetScope();
assert.deepEqual(storage.loadJSON('gauge-targets', null), { settings: { 'GEN-001': { rpm: 510 } }, history: [] });
assert.equal(storage.loadJSON('site', null), 'all');
assert.equal(storage.loadJSON('selected-unit', null), 'GEN-001');
assert.deepEqual(storage.loadJSON('tickets', []), [data.seedTickets[0]]);
assert.equal(memory.get('other-app'), 'preserve');
const migrated = JSON.stringify([...memory]); migration.migrateDatasetScope();
assert.equal(JSON.stringify([...memory]), migrated, 'migration is idempotent');
memory.delete('other-app');
for (const unit of devices) {
  for (const item of equipmentDefinitions) assert.ok(data.instrumentsForEquipment(unit.id, item.id).length);
  for (const instrument of instrumentDefinitions) for (const reading of readingsForInstrument(unit, instrument.tag)) {
    const archived = data.capabilityArchive(unit.id, 0).find(r => r.tag === reading.tag && r.channel === reading.channel && r.parameter === reading.parameter);
    assert.equal(archived.value, reading.value);
  }
}
console.log('PASS: selective idempotent fleet migration, retained preferences/key isolation, all-equipment coverage and latest capability/archive consistency.');
assert.ok(storage.saveJSON('equipment-scenarios', scenarios));
assert.deepEqual(storage.loadJSON('equipment-scenarios', emptyEquipmentSettings(), isEquipmentStore), scenarios);
assert.ok(storage.saveJSON('equipment-scenarios', { settings: { invalid: 1 } }));
assert.deepEqual(storage.loadJSON('equipment-scenarios', emptyEquipmentSettings(), isEquipmentStore), emptyEquipmentSettings());
assert.ok(storage.saveJSON('equipment-scenarios', scenarios));
assert.ok(storage.saveJSON('gauge-targets', targets));
assert.deepEqual(storage.loadJSON('gauge-targets', emptyTargets(), isTargetStore), targets);
assert.ok(storage.saveJSON('gauge-targets', { settings: { invalid: 1 } }));
assert.deepEqual(storage.loadJSON('gauge-targets', emptyTargets(), isTargetStore), emptyTargets());
assert.equal(storage.loadJSON('bad', 'default', v => typeof v === 'string'), 'default');
memory.set('genset-demo:v1:bad', '{malformed');
assert.equal(storage.loadJSON('bad', 'default'), 'default');
assert.equal(storage.saveJSON('test', 42), true);
assert.equal(storage.loadJSON('test', 0, v => typeof v === 'number'), 42);
assert.equal(storage.loadJSON('test', 'default', v => typeof v === 'string'), 'default');
memory.set('unrelated', 'keep'); storage.removeAllDemoKeys();
assert.equal(memory.size, 1); assert.equal(memory.get('unrelated'), 'keep');
assert.equal(csv.csvCell('a\rb'), '"a\rb"');
console.log('PASS: Device filters, telemetry/chart/gauge consistency, 7-day aggregation, nulls, storage fallback/reset and widget/ticket schemas.');

const conceptualMotionSource = await readFile(new URL('../src/components/conceptual-motion.tsx', import.meta.url), 'utf8');
assert.ok(conceptualMotionSource.includes('const { device } = useDemo()') && conceptualMotionSource.includes('const enabled = shouldAnimateDeviceStatus(device)'));
for (const removed of ['useState', 'setEnabled', '<button', 'aria-pressed', 'Jeda ilustrasi gerak', 'Aktifkan ilustrasi gerak', 'if (!enabled) return null']) {
  assert.ok(!conceptualMotionSource.includes(removed), 'motion is automatic, with no manual controls or hidden stopped symbols');
}
assert.ok(conceptualMotionSource.includes('Data demo, bukan feedback operasi masing-masing komponen'));
assert.ok(conceptualMotionSource.includes("enabled ? 'concept-rotor concept-rotor-running' : 'concept-rotor'"));
assert.deepEqual(devices.slice(0, 4).map(device => statusModel.shouldAnimateDeviceStatus(device)), [true, true, false, false]);
assert.match(statusCss, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.concept-rotor-running\s*\{\s*animation: conceptual-rotation 3s linear infinite;/);
assert.ok(!statusCss.includes('.concept-rotor { animation: conceptual-rotation'));
assert.ok(statusCss.includes('.concept-rotor { animation: none !important; }'));
console.log('PASS: automatic online/running component illustration, no manual controls, visible stopped symbols and reduced-motion override.');

const started = performance.now();
let sampleCount = 0;
for (const d of devices) {
  const archive = data.archiveWindow(d.id);
  sampleCount += archive.length;
  assert.equal(archive.length, data.TREND_TOTAL);
  assert.equal(archive[0].timestamp, data.ago(90 * 1440));
  assert.equal(archive.at(-1).timestamp, DEMO_NOW);
  for (let i = 0; i < archive.length; i++) {
    if (i) assert.equal(Date.parse(archive[i].timestamp) - Date.parse(archive[i - 1].timestamp), 300000);
    for (const p of history.historyParameters) assert.ok(archive[i][p] === null || Number.isFinite(archive[i][p]));
  }
  for (const p of history.historyParameters) assert.equal(archive.at(-1)[p], d.telemetry[p]);
  assert.deepEqual(data.archiveWindow(d.id, 1), archive.slice(-13));
}
assert.equal(sampleCount, 103684);
assert.deepEqual(data.archiveWindow('missing'), []);
assert.deepEqual(data.archiveWindow('GEN-001', -1), []);
assert.deepEqual(data.archiveWindow('GEN-001', NaN), []);
assert.deepEqual(data.archiveWindow('GEN-005', 6), data.archiveWindow('GEN-005', 6));
const fullUnit = history.historyDataset('GEN-002', 'ALL');
for (const p of history.historyParameters) assert.ok(history.historyStats(fullUnit[p]).count > 25000);
assert.ok(fullUnit.motorTemperature.some(p => p.value !== null && p.value > 45), 'temperature spike scenario');
assert.ok(fullUnit.rpm.some(p => p.value === 0), 'historical stop scenario');
assert.ok(fullUnit.rpm.some(p => p.value === null), 'communication gap scenario');
assert.ok(history.historySeries('GEN-001', 'voltage', '7D').some(p => p.value !== null), 'offline unit retains archive');
assert.ok(q.telemetryRows([devices.find(d => d.id === 'GEN-001')], 168).some(r => r.value !== null && r.quality === 'simulated'));
assert.ok(history.historySeries('GEN-004', 'bldcTemperature', 'ALL').every(p => p.value === null));
assert.deepEqual(history.historyStats([{ time: '', value: NaN }, { time: '', value: Infinity }, { time: '', value: 0 }]), { count: 1, min: 0, max: 0, average: 0 });
const t1 = data.ago(10), t2 = data.ago(5), t3 = DEMO_NOW;
assert.deepEqual(history.alignHistory(['rpm', 'voltage'], {
  rpm: [{ time: t3, value: 20 }, { time: t1, value: 10 }], voltage: [{ time: t2, value: 380 }, { time: t3, value: 381 }],
}), [{ time: t1, rpm: 10 }, { time: t2, voltage: 380 }, { time: t3, rpm: 20, voltage: 381 }]);
const aligned = history.alignHistory(['motorTemperature', 'voltage'], fullUnit);
const displayIndices = history.historyDisplayIndices(aligned, ['motorTemperature', 'voltage']);
assert.ok(displayIndices.length < 2000 && displayIndices.length > 0);
assert.equal(Math.max(...displayIndices.map(i => aligned[i].motorTemperature ?? -Infinity)), history.historyStats(fullUnit.motorTemperature).max);
for (let i = 1; i < aligned.length; i++) if ((aligned[i].voltage == null) !== (aligned[i - 1].voltage == null)) {
  assert.ok(displayIndices.includes(i) && displayIndices.includes(i - 1), 'gap boundaries must survive display reduction');
}
const smallRows = q.telemetryRows(devices.slice(0, 2), 1);
for (const page of [1, 2, 3, 4]) {
  const result = q.telemetryPage(devices.slice(0, 2), 1, 'all', page);
  assert.deepEqual(result.rows, smallRows.slice((result.page - 1) * 50, result.page * 50));
}
const largePage = q.telemetryPage(devices, 2160, 'all', 999999);
assert.equal(largePage.total, 622104);
assert.ok(largePage.rows.length <= 50);
assert.equal(largePage.rows.at(-1).time, DEMO_NOW);
assert.deepEqual(q.telemetryPage([], 2160, 'all', 1), { rows: [], total: 0, page: 1 });
assert.deepEqual(q.telemetryPage(devices.slice(0, 1), 1, 'bldcTemperature', 1).rows, smallRows.filter(r => r.unit === 'GEN-001' && r.parameter === 'bldcTemperature'));
assert.equal(data.newsItems.length, 100);
assert.equal(data.seedTickets.length, 120);
assert.equal(activities.length, 364);
assert.equal(new Set(activities.map(a => a.id)).size, activities.length);
assert.ok(validators.isTicketArray(data.seedTickets));
assert.ok(validators.isWidgetArray(data.seedWidgets));
assert.ok(isTargetStore(targetModel.seedTargets()));
assert.ok(isEquipmentStore(scenarioModel.seedEquipmentSettings()));
assert.equal(applyTarget(emptyTargets(), 'GEN-020', true, 'rpm', 520, now), null);
assert.equal(applyEquipmentScenario(emptyEquipmentSettings(), 'GEN-020', true, 'breaker', 'Terbuka', now), null);
assert.equal(applyTarget(emptyTargets(), 'GEN-021', true, 'rpm', 520, now), null);
const cameraSource = await readFile(new URL('../src/pages/camera-view.tsx', import.meta.url), 'utf8');
const cameraMediaSource = await readFile(new URL('../src/components/overview/dashboard-media.tsx', import.meta.url), 'utf8');
const cameraPreviewSource = await readFile(new URL('../src/components/overview/camera-preview.tsx', import.meta.url), 'utf8');
assert.ok(cameraMediaSource.includes('onError=') && cameraMediaSource.includes('import.meta.env.BASE_URL'));
for (const source of [cameraSource, cameraPreviewSource]) {
  assert.ok(source.includes('ReferenceMediaGallery'));
  assert.ok(!source.includes('cameraAvailable'));
}
for (const file of ['genset-camera-01.png', 'genset-camera-02.png', 'genset-thermal.jpg']) {
  assert.ok(cameraMediaSource.includes(file));
  assert.ok((await readFile(new URL(`../public/media/${file}`, import.meta.url))).length > 0);
}
assert.ok(cameraMediaSource.includes('bukan live') && cameraMediaSource.includes('bukan telemetry aplikasi'));
assert.ok(cameraSource.includes('columns={cols === 1 ? 1 : cols === 2 ? 2 : 4}'));

// Exercise persistence hook transitions with a small deterministic React-hook harness.
const storageModuleUrl = `data:text/javascript;base64,${Buffer.from(ts.transpileModule(await readFile(new URL('../src/lib/storage.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`;
const hookState = [];
let hookCursor = 0;
let effectInstalled = false;
let cleanup;
globalThis.__syncHooks = {
  useState(initial) {
    const index = hookCursor++;
    if (!(index in hookState)) hookState[index] = typeof initial === 'function' ? initial() : initial;
    return [hookState[index], value => { hookState[index] = typeof value === 'function' ? value(hookState[index]) : value; }];
  },
  useRef(initial) {
    const index = hookCursor++;
    if (!(index in hookState)) hookState[index] = { current: initial };
    return hookState[index];
  },
  useEffect(effect) { if (!effectInstalled) { cleanup = effect(); effectInstalled = true; } },
};
const fakeReact = `data:text/javascript;base64,${Buffer.from('export const { useState, useEffect, useRef } = globalThis.__syncHooks;').toString('base64')}`;
const previousWindow = globalThis.window;
globalThis.window = new EventTarget();
const hookModule = await moduleFrom('../src/lib/use-persisted-state.ts', { "'react'": JSON.stringify(fakeReact), "'./storage'": JSON.stringify(storageModuleUrl) });
const numeric = value => typeof value === 'number' && Number.isFinite(value);
const renderHook = () => { hookCursor = 0; return hookModule.usePersistedState('sync-test', 2, numeric); };
let hook = renderHook();
assert.equal(hook[0], 2);
assert.equal(hook[1](4), true);
hook = renderHook();
assert.equal(hook[0], 4);
assert.equal(storage.loadJSON('sync-test', 0), 4);
assert.equal(hook[1]('invalid'), false);
assert.equal(renderHook()[0], 4);
const originalSetItem = localStorage.setItem;
localStorage.setItem = () => { throw new Error('quota'); };
assert.equal(renderHook()[1](6), false);
assert.equal(renderHook()[0], 6, 'failed writes retain session state');
assert.equal(renderHook()[2], true);
localStorage.setItem = originalSetItem;
const signalStorage = key => { const event = new Event('storage'); Object.defineProperty(event, 'key', { value: key }); window.dispatchEvent(event); };
assert.ok(storage.saveJSON('sync-test', 8));
signalStorage('unrelated');
assert.equal(renderHook()[0], 6);
signalStorage(storage.PREFIX + 'sync-test');
assert.equal(renderHook()[0], 8, 'external writes update mounted consumers');
memory.set(storage.PREFIX + 'sync-test', '{bad');
signalStorage(storage.PREFIX + 'sync-test');
assert.equal(renderHook()[0], 2, 'invalid external state uses validated fallback');
assert.ok(storage.saveJSON('sync-test', 10));
signalStorage(storage.PREFIX + 'sync-test');
assert.equal(renderHook()[0], 10);
memory.set('genset-demo-other-app', 'preserve');
assert.equal(storage.removeAllDemoKeys(), true);
signalStorage(null);
assert.equal(renderHook()[0], 2, 'reset propagates fallback to mounted consumers');
assert.equal(memory.get('genset-demo-other-app'), 'preserve');
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = () => { throw new Error('blocked'); };
memory.set(storage.PREFIX + 'reset-test', '1');
assert.equal(storage.removeAllDemoKeys(), false);
localStorage.removeItem = originalRemoveItem;
cleanup?.();
globalThis.window = previousWindow;
delete globalThis.__syncHooks;
assert.equal(validators.isTicketArray([data.seedTickets[0], data.seedTickets[0]]), false);
assert.equal(validators.isWidgetArray(Array.from({ length: 51 }, (_, i) => ({ ...data.seedWidgets[0], id: `limit-${i}` }))), false);
const syncContext = await readFile(new URL('../src/context/demo-context.tsx', import.meta.url), 'utf8');
for (const key of ['site', 'selected-unit', 'tickets', 'gauge-widgets', 'camera-layout', 'gauge-targets', 'equipment-scenarios']) assert.ok(syncContext.includes(`usePersistedState('${key}'`));
assert.ok(overviewSource.includes('Last seen: {dateTime(device.lastSeen)}'));
assert.ok(alertsSource.includes('recentActivities.slice(') && alertsSource.includes('dateTime(a.timestamp)'));
const supportSource = await readFile(new URL('../src/pages/support.tsx', import.meta.url), 'utf8');
assert.ok(supportSource.includes('tickets.length >= 200') && !supportSource.includes('next.slice(0, 200)'));
console.log('PASS: shared persistent state, external writes/reset, malformed data, quota failure, key isolation, duplicate ticket/capacity guards, camera reuse and bounded dated activity.');
assert.ok((await readFile(new URL('../public/media/camera-scene.svg', import.meta.url), 'utf8')).includes('BUKAN CCTV'));
console.log(`PASS: 4-unit / 90-day archive: ${sampleCount.toLocaleString('en-US')} timestamps / ${(sampleCount * 6).toLocaleString('en-US')} channel slots; all windows, gaps, extrema, offline archive, seeds and bounded pagination checked in ${Math.round(performance.now() - started)} ms.`);

const deviceDetailSource = await readFile(new URL('../src/pages/device.tsx', import.meta.url), 'utf8');
const machineGallerySource = await readFile(new URL('../src/components/machines/machine-gallery.tsx', import.meta.url), 'utf8');
const sharedReadingSource = await readFile(new URL('../src/components/machines/instrument-readings.tsx', import.meta.url), 'utf8');
assert.ok(!deviceDetailSource.includes('onClick={() => selectDevice(d.id)}'));
assert.ok(deviceDetailSource.includes('Gunakan unit ini') && deviceDetailSource.includes('Unit aktif'));
assert.ok(deviceDetailSource.includes("['Ringkasan', 'Perangkat', 'Instrumen']"));
assert.ok(machineGallerySource.includes('visibleMachines') && machineGallerySource.includes('Reset filter'));
assert.ok(sharedReadingSource.includes('i.deviceId === device.id && i.tag === tag'));
const channelReadingSource = await readFile(new URL('../src/components/channel-reading.tsx', import.meta.url), 'utf8');
assert.ok(sharedReadingSource.includes('<ChannelReading reading={r}'));
assert.ok(channelReadingSource.includes('capabilityVisual(reading).available') && channelReadingSource.includes('isDigitalReading(reading, valueType)') && channelReadingSource.includes("typeof reading.value === 'boolean'"));
assert.ok(sharedReadingSource.includes('parameter: r.parameter') && sharedReadingSource.includes('unit: device!.id'));
console.log('PASS: Device inspection does not select units; explicit selection, detail sections, catalog filters, scoped registry readings and contextual history links.');

assert.ok(illustration.includes('showSupportingPanels = true'), 'supporting panels remain available to Visualisasi');
assert.ok(illustration.includes('{showSupportingPanels && <>'), 'supporting panels are conditional');
assert.ok(!(await readFile(new URL('../src/pages/overview.tsx', import.meta.url), 'utf8')).includes('Catatan pemetaan &amp; batas interpretasi'), 'Overview mapping notes removed');
assert.ok(!(await readFile(new URL('../src/pages/overview.tsx', import.meta.url), 'utf8')).includes('Pemetaan konseptual · Status runtime'), 'Overview mapping footer removed');
console.log('PASS: Overview hides supporting panels and mapping footer while shared illustration retains them for Visualisasi.');

const trendNavigation = await readFile(new URL('../src/components/layout/navigation.ts', import.meta.url), 'utf8');
assert.ok(trendNavigation.includes("path: '/chart-widget', label: 'Tren & Riwayat'"));
assert.ok(chartPage.includes('Tren &amp; Riwayat</h1>'));
assert.ok(!chartPage.includes('>Chart Widget</h1>'));
console.log('PASS: Tren & Riwayat navigation and page heading agree; legacy chart URL retained.');


// Manual channel targets share the sensor registry, never sensor values.
const channelModel = await moduleFrom('../src/lib/channel-targets.ts', { "'@/data/demo'": JSON.stringify(dataUrl) });
let manualChannels = channelModel.emptyChannelTargets();
const telemetryBeforeManual = JSON.stringify(devices);
for (const unit of devices) {
  for (const instrument of instruments.filter(i => i.deviceId === unit.id)) {
    for (const channel of data.demoChannels[instrument.tag] ?? []) {
      const value = typeof channel.normal === 'boolean' ? false : 0;
      assert.ok(channelModel.isChannelValue(unit.id, instrument.tag, channel.id, value));
      const next = channelModel.applyChannelTarget(manualChannels, unit.id, instrument.tag, channel.id, value, DEMO_NOW);
      if (!unit.online) { assert.equal(next, null); continue; }
      assert.ok(next);
      assert.equal(next.settings[unit.id][channelModel.channelKey(instrument.tag, channel.id)], value);
      assert.equal(channelModel.applyChannelTarget(next, unit.id, instrument.tag, channel.id, value, DEMO_NOW), null);
      manualChannels = next;
      assert.ok(channelModel.isChannelStore(JSON.parse(JSON.stringify(manualChannels))));
    }
  }
}
assert.equal(JSON.stringify(devices), telemetryBeforeManual);
for (const bad of [-1, 101, NaN, Infinity, '1', true, 0.001]) assert.equal(channelModel.isChannelValue('GEN-001', 'PM-01', 'current', bad), false);
for (const bad of [0, 1, 'false', null]) assert.equal(channelModel.isChannelValue('GEN-001', 'LSL-19', 'low', bad), false);
assert.equal(channelModel.isChannelValue('GEN-001', 'VT-401', 'vibration', 20), true);
assert.equal(channelModel.isChannelValue('GEN-001', 'VT-401', 'vibration', 20.01), false);
assert.equal(channelModel.isChannelValue('GEN-001', 'missing', 'current', 1), false);
assert.equal(channelModel.isChannelStore({ settings: { unknown: {} }, history: [] }), false);
assert.equal(channelModel.isChannelStore({ settings: { 'GEN-001': { 'PM-01/current/extra': 1 } }, history: [] }), false);
assert.equal(channelModel.applyChannelTarget(manualChannels, 'GEN-001', 'PM-01', 'current', 1, 'invalid'), null);
assert.equal(manualChannels.history.length, 100);
const isolatedChannels = channelModel.applyChannelTarget(manualChannels, 'GEN-001', 'PM-01', 'current', 12.34, DEMO_NOW);
assert.equal(isolatedChannels.settings['GEN-002']['PM-01/current'], 0);
assert.equal(isolatedChannels.settings['GEN-001']['PM-01/power'], 0);
assert.equal(manualChannels.settings['GEN-001']['PM-01/current'], 0);
assert.deepEqual(channelModel.emptyChannelTargets(), { settings: {}, history: [] });
assert.ok(equipmentUi.includes('<ChannelTargetControl'));
console.log('PASS: manual channels, strict numeric/boolean validation, offline guards, isolated immutable state, persistence and bounded history.');

const hookMockUrl = 'data:text/javascript;base64,' + Buffer.from(`
export const state = [];
export function useState(initial) { const index = state.length; state.push(typeof initial === 'function' ? initial() : initial); return [state[index], next => { state[index] = next; }]; }
export const useRef = current => ({ current });
export const useEffect = () => {};
`).toString('base64');
const storageMockUrl = 'data:text/javascript;base64,' + Buffer.from(`
export const PREFIX = 'test:';
export const writes = [];
export let fail = false;
export const setFailure = value => { fail = value; };
export const loadJSON = (key, fallback) => fallback;
export const saveJSON = (key, value) => { writes.push(value); return !fail; };
`).toString('base64');
const hookModel = await moduleFrom('../src/lib/use-persisted-state.ts', { "'react'": JSON.stringify(hookMockUrl), "'./storage'": JSON.stringify(storageMockUrl) });
const mockStorage = await import(storageMockUrl);
const [, commitCounter] = hookModel.usePersistedState('counter', 0, v => Number.isInteger(v) && v >= 0);
commitCounter(previous => previous + 1);
commitCounter(previous => previous + 1);
assert.deepEqual(mockStorage.writes, [1, 2]);
assert.equal(commitCounter(-1), false);
assert.deepEqual(mockStorage.writes, [1, 2]);
mockStorage.setFailure(true);
assert.equal(commitCounter(previous => previous + 1), false);
mockStorage.setFailure(false);
commitCounter(previous => previous + 1);
assert.deepEqual(mockStorage.writes, [1, 2, 3, 4]);
console.log('PASS: consecutive functional persistence commits, invalid-value rejection and session fallback after storage failure.');


// Global theme validation remains independent of telemetry and profile preferences.
const themeSource = await readFile(new URL('../src/lib/theme.ts', import.meta.url), 'utf8');
const themeModule = await import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(themeSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`);
assert.equal(themeModule.defaultTheme, 'dark');
for (const value of ['light', 'dark']) assert.ok(themeModule.isTheme(value));
for (const value of [null, undefined, '', 'system', 'DARK', {}, 0, true]) assert.equal(themeModule.isTheme(value), false);
const bootstrapSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(bootstrapSource.includes('genset-demo:v1:theme') && bootstrapSource.includes("let theme = 'dark'") && bootstrapSource.includes("=== 'light'"));
assert.ok(bootstrapSource.includes('content="#111c2e"'));
const themeToggleSource = await readFile(new URL('../src/components/theme-toggle.tsx', import.meta.url), 'utf8');
assert.ok(themeToggleSource.includes('role="switch"') && themeToggleSource.includes('aria-checked='));
assert.ok(themeToggleSource.includes("usePersistedState('theme', defaultTheme, isTheme)"));
console.log('PASS: strict global light/dark theme validation, accessible persisted toggle and first-paint bootstrap.');
