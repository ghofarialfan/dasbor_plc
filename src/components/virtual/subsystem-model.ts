import { equipmentLayout, overviewConnections } from '@/components/overview/equipment-layout';

export const shaftConnections = overviewConnections.filter(connection => connection.style === 'shaft');
export const draftCableConnections = overviewConnections.filter(connection => connection.style === 'cable' && 'route' in connection);
export const pmgConnections = overviewConnections.filter(connection => connection.style === 'belt' || (connection.style === 'cable' && !('route' in connection)));
export const oilConnections = overviewConnections.filter(connection => connection.style === 'lubrication');

export function orderedItems(connections: typeof overviewConnections): number[] {
  return [...new Set(connections.flatMap(connection => [connection.from, connection.to].flatMap(endpoint => 'item' in endpoint ? [endpoint.item] : [])))];
}

export function subsystemItem(item: number) {
  const entry = equipmentLayout.find(position => position.item === item);
  if (!entry) throw new Error(`Missing subsystem item ${item}`);
  return entry;
}
