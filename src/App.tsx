import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Overview } from '@/pages/overview';
import { DevicePage } from '@/pages/device';
import { VirtualPage } from '@/pages/virtual';
import { DataPage } from '@/pages/data';
import { Placeholder } from '@/pages/placeholder';

const pages: Record<string, ReactNode> = {
  '/device': <DevicePage />,
  '/virtual': <VirtualPage />,
  '/data': <DataPage />,
};

export default function App() {
  return <Routes><Route element={<AppShell />}><Route index element={<Overview />} />{Object.entries(pages).map(([path, node]) => <Route key={path} path={path} element={node} />)}<Route path="*" element={<Placeholder />} /></Route></Routes>;
}

