import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Overview } from '@/pages/overview';
import { DevicePage } from '@/pages/device';
import { VirtualPage } from '@/pages/virtual';
import { DataPage } from '@/pages/data';
import { GaugeWidgetPage } from '@/pages/gauge-widget';
import { ChartWidgetPage } from '@/pages/chart-widget';
import { CameraViewPage } from '@/pages/camera-view';
import { NewsPage } from '@/pages/news';
import { SupportPage } from '@/pages/support';
import { ProfilePage } from '@/pages/profile';
import { LogoutPage } from '@/pages/logout';
import { Placeholder } from '@/pages/placeholder';

const pages: Record<string, ReactNode> = {
  '/device': <DevicePage />,
  '/virtual': <VirtualPage />,
  '/data': <DataPage />,
  '/gauge-widget': <GaugeWidgetPage />,
  '/chart-widget': <ChartWidgetPage />,
  '/camera-view': <CameraViewPage />,
  '/news': <NewsPage />,
  '/support': <SupportPage />,
  '/profile': <ProfilePage />,
  '/logout': <LogoutPage />,
};

export default function App() {
  return <Routes><Route element={<AppShell />}><Route index element={<Overview />} />{Object.entries(pages).map(([path, node]) => <Route key={path} path={path} element={node} />)}<Route path="*" element={<Placeholder />} /></Route></Routes>;
}

