import { useLayoutEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersistedState } from '@/lib/use-persisted-state';
import { applyTheme, defaultTheme, isTheme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme, storageError] = usePersistedState('theme', defaultTheme, isTheme);
  useLayoutEffect(() => applyTheme(theme), [theme]);
  return <>
    <Button type="button" variant="ghost" size="icon" role="switch" aria-label="Night mode" aria-checked={theme === 'dark'} title={theme === 'dark' ? 'Gunakan mode terang' : 'Gunakan night mode'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
    </Button>
    {storageError && <p role="alert" className="fixed inset-x-4 top-20 z-[60] mx-auto max-w-md rounded-lg border border-border bg-warning-soft p-3 text-xs text-warning shadow-lg">Tema tidak dapat disimpan; pilihan hanya berlaku selama sesi ini.</p>}
  </>;
}
