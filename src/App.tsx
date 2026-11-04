import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { Overview } from '@/pages/overview';
import { Placeholder } from '@/pages/placeholder';
import { navigation } from '@/components/layout/navigation';
export default function App() {
  return <Routes><Route element={<AppShell />}><Route index element={<Overview />} />{navigation.filter(n => n.path !== '/').map(n => <Route key={n.path} path={n.path} element={<Placeholder />} />)}<Route path="*" element={<Placeholder />} /></Route></Routes>;
}
