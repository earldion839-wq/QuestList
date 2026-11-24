import React from 'react';
import {
  Download,
  Layers,
  Pencil,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { TaskItem, TodoList } from '../types';
import { calculateListProgress } from '../utils/tasks';
import { ListIcon } from './ListIcon';

interface SidebarProps {
  lists: TodoList[];
  tasks: TaskItem[];
  activeListId: string | 'all';
  onSelectList: (id: string | 'all') => void;
  onCreateList: () => void;
  onEditList: (list: TodoList) => void;
  onOpenMods: () => void;
  onOpenInstallExport: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lists,
  tasks,
  activeListId,
  onSelectList,
  onCreateList,
  onEditList,
  onOpenMods,
  onOpenInstallExport,
  isMobileOpen,
  onCloseMobile,
}) => {
  const allProgress = calculateListProgress(tasks, 'all');

  const sidebarContent = (
    <aside
      aria-label="Activity lists navigation"
      className="flex h-full w-[280px] shrink-0 flex-col border-r"
      style={{
        backgroundColor: 'var(--mod-surface)',
        borderColor: 'var(--mod-border)',
        color: 'var(--mod-text)',
      }}
    >
      {/* Brand Wordmark */}
      <div
        className="flex h-16 items-center justify-between border-b px-5"
        style={{ borderColor: 'var(--mod-border)' }}
      >
        <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
          QuestList Studio
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-md p-2 lg:hidden hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Overview */}
        <div>
          <button
            type="button"
            onClick={() => {
              onSelectList('all');
              onCloseMobile();
            }}
            className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              backgroundColor:
                activeListId === 'all' ? 'var(--mod-accent-soft)' : 'transparent',
              color: activeListId === 'all' ? 'var(--mod-accent)' : 'var(--mod-text)',
              outlineColor: 'var(--mod-accent)',
            }}
          >
            <span className="flex items-center gap-2.5 truncate">
              <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">All Activities</span>
            </span>
            <span
              className="tabular-nums text-xs font-medium shrink-0 ml-2"
              style={{
                color:
                  activeListId === 'all' ? 'var(--mod-accent)' : 'var(--mod-text-muted)',
              }}
            >
              {allProgress.active}
            </span>
          </button>
        </div>

        {/* Activity Lists */}
        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <h2
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Activity Lists
            </h2>
            <button
              type="button"
              onClick={onCreateList}
              aria-label="Create new activity list"
              className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0"
              style={{ color: 'var(--mod-accent)', outlineColor: 'var(--mod-accent)' }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              New
            </button>
          </div>

          <nav aria-label="Lists" className="space-y-1">
            {lists.map((list) => {
              const progress = calculateListProgress(tasks, list.id);
              const isActive = activeListId === list.id;

              return (
                <div key={list.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectList(list.id);
                      onCloseMobile();
                    }}
                    className="flex flex-1 min-w-0 items-center justify-between px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      backgroundColor: isActive ? 'var(--mod-accent-soft)' : 'transparent',
                      color: isActive ? 'var(--mod-accent)' : 'var(--mod-text)',
                      outlineColor: 'var(--mod-accent)',
                    }}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <ListIcon name={list.iconName} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{list.name}</span>
                    </span>
                    <span
                      className="tabular-nums text-xs shrink-0 ml-2"
                      style={{
                        color: isActive ? 'var(--mod-accent)' : 'var(--mod-text-muted)',
                      }}
                    >
                      {progress.active}/{progress.total}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditList(list)}
                    aria-label={`Customize ${list.name}`}
                    className="rounded p-2 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
                    style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onCreateList}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed px-3 py-2 text-xs font-medium transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              borderColor: 'var(--mod-border)',
              color: 'var(--mod-text-muted)',
              outlineColor: 'var(--mod-accent)',
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Create Custom List
          </button>
        </div>
      </div>

      {/* Bottom Workspace Tools */}
      <div
        className="border-t p-3 space-y-2"
        style={{ borderColor: 'var(--mod-border)' }}
      >
        <button
          type="button"
          onClick={() => {
            onOpenMods();
            onCloseMobile();
          }}
          className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
          style={{
            borderRadius: 'var(--mod-radius-sm)',
            backgroundColor: 'var(--mod-surface-elevated)',
            color: 'var(--mod-text)',
            outlineColor: 'var(--mod-accent)',
          }}
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
            Website Mods & Theme
          </span>
          <span style={{ color: 'var(--mod-text-muted)' }}>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenInstallExport();
            onCloseMobile();
          }}
          className="flex w-full items-center justify-between border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
          style={{
            borderRadius: 'var(--mod-radius-sm)',
            borderColor: 'var(--mod-border)',
            color: 'var(--mod-text-muted)',
            outlineColor: 'var(--mod-accent)',
          }}
        >
          <span className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Install App & Backup
          </span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
