import { ToastHost } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { Link, useParams } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';
import { useDocumentMeta } from '@shared/seo/use-document-meta.ts';
import { DrawerHost } from '@shared/ui/drawer/drawer-host.tsx';

import { HistoryProvider } from '../providers/history-provider.tsx';
import { useSidebarState } from '../utils/use-sidebar-state.ts';
import { DropArea } from './parts/drop-area/drop-area.tsx';
import { HistorySidebar } from './parts/history-sidebar/history-sidebar.tsx';
import { MobileHistory } from './parts/mobile-history/mobile-history.tsx';
import { TopBar } from './parts/top-bar/top-bar.tsx';

// Composition root. The provider owns local history. Desktop shows the closeable
// right sidebar (toggled from the top bar); mobile shows a bottom bar that
// raises the history in a drawer (DrawerHost). One screen, two history surfaces.
export function UploadScreen() {
  return (
    <HistoryProvider>
      <DrawerHost>
        <UploadScreenContent />
      </DrawerHost>
    </HistoryProvider>
  );
}

function UploadScreenContent() {
  const sidebar = useSidebarState();
  const { code } = useParams<{ code?: string }>();
  // Branch SEO on whether this mount is the homepage or a /s/:code deep link.
  // Code routes are user-bearer URLs so we never want them in search indexes.
  useDocumentMeta(
    code
      ? {
          title: 'Redeem your file — FileSalad',
          description: 'Enter your share code or follow the link to download.',
          path: '/',
          robots: 'noindex',
        }
      : {
          title: 'FileSalad — Drop a file, get a public link',
          description:
            'Turn any file into a short, shareable link in two clicks. No signup, links expire automatically.',
          path: '/',
          robots: 'index',
        },
  );

  return (
    <div className="fs-backdrop flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar isSidebarOpen={sidebar.isOpen} onToggleSidebar={sidebar.toggle} />
          <main className="flex flex-1 items-center justify-center px-6 pb-10">
            <DropArea />
          </main>
          <footer className="px-6 pb-4 text-center">
            <Link
              to={ROUTES.PRIVACY}
              className="text-xs font-medium text-white/80 hover:text-white hover:underline"
            >
              Privacy
            </Link>
          </footer>
        </div>

        {/* Right sidebar on desktop; hidden on mobile (history goes to bottom). */}
        <Show when={sidebar.isOpen}>
          <div className="hidden md:block">
            <HistorySidebar onClose={sidebar.close} />
          </div>
        </Show>
      </div>

      {/* Bottom history bar — mobile only (md:hidden); raises the drawer. */}
      <MobileHistory />
      <ToastHost position="bottom" />
    </div>
  );
}
