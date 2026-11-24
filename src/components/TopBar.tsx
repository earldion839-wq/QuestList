import React from 'react';
import { Download, Menu, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  activeListName: string;
  onOpenMobileNav: () => void;
  onOpenMods: () => void;
  onOpenInstallExport: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeListName,
  onOpenMobileNav,
  onOpenMods,
  onOpenInstallExport,
  isInstallable,
  isInstalled,
}) => {
  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: 'var(--mod-surface)',
        borderColor: 'var(--mod-border)',
        color: 'var(--mod-text)',
      }}
    >
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open activity lists menu"
          className="rounded-md p-2 lg:hidden hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
          style={{ color: 'var(--mod-text)', outlineColor: 'var(--mod-accent)' }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
          <span
            className="hidden sm:inline whitespace-nowrap shrink-0"
            style={{ color: 'var(--mod-text-muted)' }}
          >
            Workspace
          </span>
          <span
            className="hidden sm:inline shrink-0"
            style={{ color: 'var(--mod-text-muted)' }}
            aria-hidden="true"
          >
            /
          </span>
          <span className="font-semibold truncate">{activeListName}</span>
        </nav>
      </div>

      {/* Right: At most 2 crisp single-line actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenMods}
          className="inline-flex items-center gap-1.5 sm:gap-2 border px-2.5 sm:px-3.5 py-2 text-xs font-medium transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0"
          style={{
            borderRadius: 'var(--mod-radius-sm)',
            borderColor: 'var(--mod-border)',
            backgroundColor: 'var(--mod-surface-elevated)',
            color: 'var(--mod-text)',
            outlineColor: 'var(--mod-accent)',
          }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
          <span className="sm:hidden">Mods</span>
          <span className="hidden sm:inline">Website Mods</span>
        </button>

        <button
          type="button"
          onClick={onOpenInstallExport}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0"
          style={{
            borderRadius: 'var(--mod-radius-sm)',
            backgroundColor: 'var(--mod-accent)',
            color: 'var(--mod-accent-fg)',
            outlineColor: 'var(--mod-accent)',
          }}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sm:hidden">
            {isInstallable ? 'Install' : isInstalled ? 'Export' : 'Get App'}
          </span>
          <span className="hidden sm:inline">
            {isInstallable
              ? 'Install on Laptop'
              : isInstalled
              ? 'Export Backup'
              : 'Download App'}
          </span>
        </button>
      </div>
    </header>
  );
};
