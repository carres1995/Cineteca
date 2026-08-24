// src/presentation/app/Layout.tsx
import { Suspense } from 'react';
import { Film } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { LoadingState } from '@/presentation/components/Common/LoadingState';
import { messages } from '@/presentation/i18n/messages';
import { cn } from '@/presentation/lib/cn';

const links = [
  { to: '/', label: messages.nav.home, end: true },
  { to: '/explorar', label: messages.nav.discover, end: false },
  { to: '/buscar', label: messages.nav.search, end: false },
  { to: '/cineteca', label: messages.nav.library, end: false },
];

export function Layout() {
  return (
    <div className="bg-surface text-ink flex min-h-dvh flex-col">
      {/* Primer tabulador de la página: sin esto, llegar al contenido con
          teclado son quince pulsaciones. */}
      <a
        href="#contenido"
        className="bg-brand text-surface focus:ring-ink sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:px-4 focus:py-2"
      >
        {messages.skipToContent}
      </a>

      <header className="border-surface-raised border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Film aria-hidden="true" className="text-brand size-5" />
            {messages.appName}
          </p>
          <nav aria-label={messages.appName}>
            <ul className="flex gap-4">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'focus-visible:outline-ink inline-flex items-center rounded px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2',
                        isActive ? 'text-brand font-semibold underline' : 'text-ink-muted',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Atribución a TMDB: no es un detalle estético, es la licencia bajo la
          que consumimos el servicio. Logo y frase, como piden sus términos. */}
      <footer className="border-surface-raised text-ink-muted border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-6 text-sm">
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="focus-visible:outline-ink rounded focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <img src="/tmdb-logo.svg" alt="The Movie Database (TMDB)" width={120} height={16} />
          </a>
          <p>{messages.attribution}</p>
        </div>
      </footer>
    </div>
  );
}
