export function virtualTabIndex(current: number, key: string, count: number): number {
  if (count < 1) return 0;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowLeft') return (current + count - 1) % count;
  if (key === 'ArrowRight') return (current + 1) % count;
  return current;
}
