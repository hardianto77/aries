import { bundledThemeNames, themeRoleFingerprint } from 'aries-data-provider';
import {
  resolveTheme,
  clickHouseTheme,
  libreChatTheme,
  describeResolvedTheme,
} from '@aries/client';
import type { BundledThemeBoot, BundledThemeName } from 'aries-data-provider';
import type { ThemeDefinition } from '@aries/client';

export const THEME_CACHE_VERSION_PLACEHOLDER = '__THEME_CACHE_VERSION__';

/** Writes the cache version into the boot script's check, as the Vite build does for `index.html`. */
export const injectThemeCacheVersion = (html: string): string =>
  html.replace(THEME_CACHE_VERSION_PLACEHOLDER, themeRoleFingerprint());

export const bundledThemes: Readonly<Record<BundledThemeName, ThemeDefinition>> = {
  aries: libreChatTheme,
  clickhouse: clickHouseTheme,
};

/**
 * Each bundled theme in both modes as the boot script replays it. The build writes this to
 * the `THEME_BOOT_FILE` asset, and the server hands the deployment's own to the shell of a first visit.
 */
export const bundledThemeBoot = (): BundledThemeBoot =>
  Object.fromEntries(
    bundledThemeNames.map((name) => [
      name,
      {
        light: describeResolvedTheme(resolveTheme(bundledThemes[name], 'light')),
        dark: describeResolvedTheme(resolveTheme(bundledThemes[name], 'dark')),
      },
    ]),
  );
