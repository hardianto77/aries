import { memo, useCallback } from 'react';
import { SquarePen } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Constants } from 'aries-data-provider';
import useDrawerViewport from '~/hooks/Nav/useDrawerViewport';
import useSidebarToggle from '~/hooks/Nav/useSidebarToggle';
import useNewChat from '~/hooks/Conversations/useNewChat';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

/**
 * The terminal-style full-width "+ NEW CHAT" bar at the bottom of the sidebar.
 * Reuses `useNewChat` so every existing guard (drafts, drawers, drafts cleanup)
 * stays intact; on small screens it closes the drawer first, mid-slide.
 */
const PerchNewChatButton = memo(function PerchNewChatButton() {
  const localize = useLocalize();
  const location = useLocation();
  const isSmallScreen = useDrawerViewport();
  const { setSidebarOpen } = useSidebarToggle();
  const { startNewChat } = useNewChat();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      if (isSmallScreen) {
        setSidebarOpen(false, () => {
          startNewChat();
        });
        return;
      }
      startNewChat();
    },
    [isSmallScreen, setSidebarOpen, startNewChat],
  );

  const isNewChatRoute =
    location.pathname === '/c/new' || location.pathname === `/${Constants.NEW_CONVO}`;

  return (
    <a
      href="/c/new"
      onClick={handleClick}
      aria-label={localize('com_ui_new_chat')}
      className={cn(
        'border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-xs font-semibold tracking-widest uppercase transition-colors',
        isNewChatRoute && 'opacity-60',
      )}
      data-testid="perch-new-chat-button"
    >
      <SquarePen className="h-4 w-4" aria-hidden="true" />
      <span>{localize('com_ui_new_chat')}</span>
    </a>
  );
});

export default PerchNewChatButton;
