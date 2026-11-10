import { equipment, instrumentsForEquipment, readingsForInstrument } from '@/data/demo';
import { dashboardTagGroups } from '@/lib/equipment-dashboard';
import type { Device } from '@/types';

// A shared tag is displayed once even if several equipment items reference it.
export function overviewEquipmentGroups(device: Device) {
  const seen = new Set<string>();
  const cards = equipment.filter(item => item.deviceId === device.id).map(item => ({
    item,
    tags: instrumentsForEquipment(device.id, item.id).filter(instrument => {
      if (seen.has(instrument.tag)) return false;
      seen.add(instrument.tag);
      return true;
    }).map(instrument => instrument.tag),
  }));
  return dashboardTagGroups([...seen]).map(group => ({
    ...group,
    cards: cards.map(card => ({ item: card.item, tags: card.tags.filter(tag => group.tags.includes(tag)) })).filter(card => card.tags.length),
    count: group.tags.reduce((sum, tag) => sum + readingsForInstrument(device, tag).length, 0),
  }));
}
