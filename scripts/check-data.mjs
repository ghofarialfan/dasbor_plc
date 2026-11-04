import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/data/demo.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const data = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const { devices, devicesForSite, deviceForSite, alarms, activities, trends, MOTOR_DEMO_THRESHOLD, DEMO_NOW } = data;
for (const [site, expected] of [['all', [4, 2, 1, 1]], ['site-a', [2, 1, 1, 0]], ['site-b', [2, 1, 0, 1]]]) {
  const list = devicesForSite(site);
  assert.deepEqual([list.length, list.filter(d => d.online && d.status === 'running').length, list.filter(d => d.online && d.status === 'standby').length, list.filter(d => !d.online).length], expected);
  for (const selected of devices) assert.ok(list.includes(deviceForSite(site, selected.id)), 'selection must stay inside site');
  const ids = new Set(list.map(d => d.id));
  assert.equal(alarms.filter(a => ids.has(a.deviceId)).length, site === 'site-a' ? 0 : 2);
  assert.equal(activities.filter(a => ids.has(a.deviceId)).length, list.length);
}
assert.deepEqual(devices[0].telemetry, { rpm: 500, voltage: 380, frequency: 50, motorTemperature: 31, roomTemperature: 27, bldcTemperature: null });
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
  assert.equal(samples.length, 73);
  assert.equal(samples.at(-1).timestamp, DEMO_NOW);
  for (const key of ['rpm', 'voltage', 'frequency', 'motorTemperature']) assert.equal(samples.at(-1)[key], d.telemetry[key]);
  for (const hours of [1, 3, 6]) assert.equal(samples.slice(-(hours * 12 + 1)).length, hours * 12 + 1);
}
assert.ok(trends['GEN-004'].every(s => s.voltage === null && s.rpm === null));
assert.ok(trends['GEN-003'].every(s => s.voltage === 0 && s.rpm === 0));
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
  assert.deepEqual(data.instrumentsForEquipment(d.id, 'motor6'), []);
  for (const tag of ['TT-03', 'VT-07', 'VT-401']) {
    const reading = readingsForInstrument(d, tag)[0];
    assert.equal(reading.value, null); assert.equal(reading.quality, d.online ? 'not-simulated' : 'offline');
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
  assert.equal(device.telemetry.bldcTemperature, null);
  assert.equal(readingsForInstrument(device, 'TT-12')[0].quality, device.online ? 'not-simulated' : 'offline');
}
assert.equal(readingsForInstrument(devices[0], 'TT-02')[0].value, 31);
assert.equal(readingsForInstrument(devices[1], 'TT-02')[0].value, 36);
assert.equal(readingsForInstrument(devices[0], 'TT-303')[0].value, 27);
for (const tag of ['LSL-19', 'LSL-20']) {
  const i = instrumentDefinitions.find(i => i.tag === tag);
  assert.equal(i.valueType, 'digital'); assert.equal(i.unit, undefined);
  assert.equal(readingsForInstrument(devices[0], tag)[0].value, null);
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
const { ventilationFanMocks, ventilationFanStatus, ventilationFanRotates } = data;
assert.deepEqual(devices.map(d => ventilationFanStatus(d)), ['running', 'running', 'stopped', 'offline']);
assert.deepEqual(devices.map(d => ventilationFanRotates(ventilationFanStatus(d))), [true, true, false, false]);
for (const status of ['stopped', 'offline', 'unknown', 'not-simulated']) assert.equal(ventilationFanRotates(status), false);
assert.equal(ventilationFanRotates('running', true), false, 'visual pause stops blades');
assert.equal(ventilationFanRotates('running', false), true, 'visual resume permits rotation');
assert.equal(ventilationFanStatus({ ...devices[0], status: 'standby' }), 'running', 'fan must not derive from genset standby');
assert.equal(ventilationFanStatus({ ...devices[2], status: 'running' }), 'stopped', 'fan must not derive from genset running');
assert.equal(ventilationFanStatus(devices[3], { ...ventilationFanMocks, 'GEN-004': 'running' }), 'offline', 'offline overrides stale running mock');
assert.equal(ventilationFanStatus(devices[0], { 'GEN-001': 'unknown' }), 'unknown');
assert.equal(ventilationFanStatus({ id: 'UNMAPPED', online: true }), 'not-simulated');
const illustration = await readFile(new URL('../src/components/overview/machine-illustration.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
assert.equal((illustration.match(/className="ventilation-fan-blades"/g) ?? []).length, 1, 'only fan blades get rotation class');
assert.ok(illustration.includes("ventilationFanRotates(fanStatus, fanPaused) ? 'running' : 'paused'"));
assert.ok(illustration.includes('pointerEvents="none" aria-hidden="true"'));
assert.ok(styles.includes('transform-origin: 1425px 168px'));
assert.match(styles, /prefers-reduced-motion: reduce\) \{ \.ventilation-fan-blades \{ animation: none !important/);
const { qualityLabels, ventilationFanStatusLabels } = data;
assert.equal(qualityLabels.simulated, 'Nilai terbaru');
assert.equal(qualityLabels['not-simulated'], 'Belum ada data');
assert.equal(qualityLabels['no-current-data'], 'Belum ada data terkini');
assert.equal(qualityLabels.offline, 'Offline');
assert.equal(ventilationFanStatusLabels['not-simulated'], 'Belum ada data');
assert.equal(ventilationFanStatusLabels.running, 'Berjalan (running)');
console.log('PASS: copy labels use neutral wording and keep design-status certainty labels unchanged.');
console.log('PASS: independent per-device M-301 mock, offline/unknown/stopped guards, visual pause/resume and reduced-motion source checks.');
console.log('PASS: fleet/filter invariants, deterministic trends, device-scoped instruments, tag mapping, null/quality semantics, digital levels, unresolved units, independent RPM/Hz, and conceptual flow certainty.');
