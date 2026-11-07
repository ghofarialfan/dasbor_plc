import { equipmentLayout, overviewBounds, overviewConnections, type Point } from './equipment-layout';

function endpoint(item: number, anchor: 'left' | 'right' | 'top' | 'bottom'): Point {
  const node = equipmentLayout.find(position => position.item === item);
  if (!node) throw new Error(`Missing layout item ${item}`);
  return node.anchors[anchor];
}
function connectionEndpoint(value: { item: number; anchor: 'left' | 'right' | 'top' | 'bottom' } | { corridor: string }): Point {
  if ('corridor' in value) throw new Error('Expected an equipment anchor, received a route corridor');
  return endpoint(value.item, value.anchor);
}

export function connectionPath(connection: (typeof overviewConnections)[number]): string {
  const corridor = overviewBounds.routes;
  if (connection.style === 'lubrication') {
    const start = connectionEndpoint(connection.from);
    const end = connectionEndpoint(connection.to);
    return `M ${start.x} ${start.y} V ${corridor.lubricationY} H ${end.x} V ${end.y}`;
  }
  if (connection.id.startsWith('shaft-')) {
    const start = connectionEndpoint(connection.from);
    const end = connectionEndpoint(connection.to);
    return `M ${start.x} ${start.y} H ${end.x}`;
  }
  if (connection.id.startsWith('belt-')) {
    const end = connectionEndpoint(connection.to);
    const commonY = (endpoint(10, 'left').y + endpoint(11, 'left').y) / 2;
    return `M ${corridor.beltStartX} ${commonY} H ${corridor.beltJunctionX} V ${end.y} H ${end.x}`;
  }
  if (connection.id === 'cable-1-12') {
    const start = connectionEndpoint(connection.from);
    const end = connectionEndpoint(connection.to);
    return `M ${start.x} ${start.y} H ${corridor.leftCableX} V ${end.y} H ${end.x}`;
  }
  if (connection.id === 'cable-output-17') {
    const start = connectionEndpoint(connection.to);
    return `M ${corridor.outputJoinX} ${start.y} H ${start.x}`;
  }
  if (connection.id.includes('-branch')) {
    const start = connectionEndpoint(connection.from);
    const branchX = corridor.outputJoinX - 38;
    return `M ${start.x} ${start.y} H ${branchX} V ${endpoint(17, 'left').y} H ${corridor.outputJoinX}`;
  }
  const start = connectionEndpoint(connection.from);
  const end = connectionEndpoint(connection.to);
  const middle = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} H ${middle} V ${end.y} H ${end.x}`;
}
