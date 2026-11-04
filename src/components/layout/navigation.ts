import { LayoutDashboard, Cpu, Boxes, Table2, Gauge, ChartNoAxesCombined, Camera, Newspaper, LifeBuoy, UserRound, LogOut } from 'lucide-react';
export const navigation = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, milestone: 1 },
  { path: '/device', label: 'Device', icon: Cpu, milestone: 2 },
  { path: '/virtual', label: 'Virtual', icon: Boxes, milestone: 2 },
  { path: '/data', label: 'Data', icon: Table2, milestone: 2 },
  { path: '/gauge-widget', label: 'Gauge Widget', icon: Gauge, milestone: 3 },
  { path: '/chart-widget', label: 'Chart Widget', icon: ChartNoAxesCombined, milestone: 3 },
  { path: '/camera-view', label: 'Camera View', icon: Camera, milestone: 3 },
  { path: '/news', label: 'News', icon: Newspaper, milestone: 4 },
  { path: '/support', label: 'Support', icon: LifeBuoy, milestone: 4 },
  { path: '/profile', label: 'Profile', icon: UserRound, milestone: 4 },
  { path: '/logout', label: 'Logout', icon: LogOut, milestone: 4 },
];
