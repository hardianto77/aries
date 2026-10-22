import { memo, useId, useMemo, useState } from 'react';
import * as Ariakit from '@ariakit/react';
import { ChevronDown } from 'lucide-react';
import { DropdownPopup, buttonVariants } from '@aries/client';
import type { NavLink } from '~/common';
import type * as t from '~/common';
import { useActivePanel, resolveActivePanel } from '~/Providers';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

/**
 * The desktop sidebar's mode dropdown, Perch-style: sits on the brand row and
 * names the panel you are in ('Chat ▾'), opening the same panel list the icon
 * rail offers. Mirrors the mobile drawer's `Switcher` so both surfaces switch
 * panels through one labelled control rather than unlabelled glyphs.
 */
function PerchPanelSwitcher({
  links,
  onNavigate,
  routeActiveId,
  onLeaveInsights,
}: {
  links: NavLink[];
  onNavigate?: () => void;
  routeActiveId?: string;
  onLeaveInsights?: () => void;
}) {
  const localize = useLocalize();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const { active, setActive } = useActivePanel();

  const activeId = routeActiveId ?? resolveActivePanel(active, links);
  const activeLink = links.find((link) => link.id === activeId);

  const items = useMemo<t.MenuItemProps[]>(
    () =>
      links.map((link) => ({
        id: `nav-panel-${link.id}`,
        label: localize(link.title),
        ariaChecked: link.id === activeId,
        className: link.id === activeId ? 'bg-surface-nav-selected' : undefined,
        icon: <link.icon className="text-text-primary size-5" aria-hidden="true" />,
        onClick: () => {
          if (link.onClick) {
            link.onClick();
            onNavigate?.();
            return;
          }
          setActive(link.id);
          if (routeActiveId) {
            onLeaveInsights?.();
          }
        },
      })),
    [links, activeId, localize, onNavigate, routeActiveId, onLeaveInsights, setActive],
  );

  if (!activeLink) {
    return null;
  }

  return (
    <DropdownPopup
      portal={true}
      menuId={menuId}
      focusLoop={true}
      unmountOnHide={true}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      items={items}
      minWidth="15rem"
      iconClassName="mr-2 size-5"
      trigger={
        <Ariakit.MenuButton
          data-testid="perch-panel-switcher"
          aria-label={localize('com_nav_control_panel')}
          aria-expanded={isOpen}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'text-text-secondary hover:text-text-primary ml-auto h-7 shrink-0 gap-0.5 rounded-lg px-1.5 text-xs font-medium',
          )}
        >
          
          <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
        </Ariakit.MenuButton>
      }
    />
  );
}

export default memo(PerchPanelSwitcher);
