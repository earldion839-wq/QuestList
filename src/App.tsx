import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCheck,
  Pencil,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { InstallExportModal } from './components/InstallExportModal';
import { ListIcon } from './components/ListIcon';
import { ListModal } from './components/ListModal';
import { ModStudioDrawer } from './components/ModStudioDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sidebar } from './components/Sidebar';
import { NewTaskDraft, TaskComposer } from './components/TaskComposer';
import { TaskRow } from './components/TaskRow';
import { TopBar } from './components/TopBar';
import { SEED_LISTS, SEED_TASKS } from './data/seedData';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  ModConfig,
  SortOrder,
  StatusFilter,
  TaskItem,
  TaskPriority,
  TodoList,
  WorkspaceBackup,
} from './types';
import { playModSound } from './utils/sound';
import {
  calculateListProgress,
  filterAndSortTasks,
  moveTaskOrder,
} from './utils/tasks';
import {
  applyModToDocument,
  computeAccessibleTokens,
  DEFAULT_MOD_CONFIG,
} from './utils/theme';

const STORAGE_KEYS = {
  lists: 'questlist_lists_v1',
  tasks: 'questlist_tasks_v1',
  mod: 'questlist_mod_v1',
  activeList: 'questlist_active_list_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lists, setLists] = useState<TodoList[]>(() =>
    loadFromStorage<TodoList[]>(STORAGE_KEYS.lists, SEED_LISTS)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadFromStorage<TaskItem[]>(STORAGE_KEYS.tasks, SEED_TASKS)
  );
  const [modConfig, setModConfig] = useState<ModConfig>(() =>
    loadFromStorage<ModConfig>(STORAGE_KEYS.mod, DEFAULT_MOD_CONFIG)
  );
  const [activeListId, setActiveListId] = useState<string | 'all'>(() =>
    loadFromStorage<string | 'all'>(STORAGE_KEYS.activeList, SEED_LISTS[0].id)
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('manual');
  const [searchQuery, setSearchQuery] = useState('');

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isModsOpen, setIsModsOpen] = useState(false);
  const [isInstallExportOpen, setIsInstallExportOpen] = useState(false);
  const [listModalState, setListModalState] = useState<{
    isOpen: boolean;
    editingList: TodoList | null;
  }>({ isOpen: false, editingList: null });

  const [undoSnapshot, setUndoSnapshot] = useState<{
    message: string;
    previousTasks: TaskItem[];
  } | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(lists));
    } catch {
      // Ignore storage quota errors
    }
  }, [lists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.mod, JSON.stringify(modConfig));
    } catch {
      // Ignore storage quota errors
    }
  }, [modConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.activeList, JSON.stringify(activeListId));
    } catch {
      // Ignore storage quota errors
    }
  }, [activeListId]);

  // Apply CSS Custom Properties live when ModConfig updates
  const themeTokens = useMemo(() => computeAccessibleTokens(modConfig), [modConfig]);
  useEffect(() => {
    applyModToDocument(modConfig);
  }, [modConfig]);

  // Ensure activeListId remains valid if a list is deleted
  useEffect(() => {
    if (activeListId !== 'all' && !lists.some((l) => l.id === activeListId)) {
      setActiveListId(lists[0]?.id ?? 'all');
    }
  }, [lists, activeListId]);

  // Auto-dismiss undo toast
  useEffect(() => {
    if (!undoSnapshot) return;
    const timer = window.setTimeout(() => setUndoSnapshot(null), 5500);
    return () => window.clearTimeout(timer);
  }, [undoSnapshot]);

  const activeList = useMemo(
    () => (activeListId === 'all' ? null : lists.find((l) => l.id === activeListId) ?? null),
    [lists, activeListId]
  );

  const listMap = useMemo(() => new Map(lists.map((l) => [l.id, l])), [lists]);

  const visibleTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        listId: activeListId,
        status: statusFilter,
        priority: priorityFilter,
        searchQuery,
        sortBy: sortOrder,
      }),
    [tasks, activeListId, statusFilter, priorityFilter, searchQuery, sortOrder]
  );

  const progress = useMemo(
    () => calculateListProgress(tasks, activeListId),
    [tasks, activeListId]
  );

  const visibleIds = useMemo(() => visibleTasks.map((t) => t.id), [visibleTasks]);

  // Handlers
  const handleAddTask = (draft: NewTaskDraft) => {
    const minOrder = tasks.reduce((min, t) => Math.min(min, t.order), 1);
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      listId: draft.listId,
      title: draft.title,
      completed: false,
      priority: draft.priority,
      location: draft.location,
      category: draft.category,
      dueDate: draft.dueDate,
      notes: '',
      subtasks: [],
      createdAt: Date.now(),
      completedAt: null,
      order: minOrder - 1,
    };
    setTasks((prev) => [newTask, ...prev]);
    playModSound('add', modConfig.soundEnabled);
  };

  const handleToggleComplete = (taskId: string) => {
    let becameCompleted = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        becameCompleted = !t.completed;
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? Date.now() : null,
        };
      })
    );
    playModSound(becameCompleted ? 'complete' : 'click', modConfig.soundEnabled);
  };

  const handleUpdateTask = (taskId: string, patch: Partial<TaskItem>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    setUndoSnapshot({
      message: `Removed "${target.title}"`,
      previousTasks: tasks,
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    playModSound('click', modConfig.soundEnabled);
  };

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
    setTasks((prev) => moveTaskOrder(prev, taskId, direction, visibleIds));
    playModSound('click', modConfig.soundEnabled);
  };

  const handleClearCompleted = () => {
    const completedInScope = tasks.filter(
      (t) => t.completed && (activeListId === 'all' || t.listId === activeListId)
    );
    if (completedInScope.length === 0) return;
    setUndoSnapshot({
      message: `Cleared ${completedInScope.length} completed task${
        completedInScope.length === 1 ? '' : 's'
      }`,
      previousTasks: tasks,
    });
    setTasks((prev) =>
      prev.filter(
        (t) => !(t.completed && (activeListId === 'all' || t.listId === activeListId))
      )
    );
    playModSound('click', modConfig.soundEnabled);
  };

  const handleSaveList = (savedList: TodoList) => {
    const exists = lists.some((l) => l.id === savedList.id);
    if (exists) {
      setLists((prev) => prev.map((l) => (l.id === savedList.id ? savedList : l)));
    } else {
      setLists((prev) => [...prev, savedList]);
      setActiveListId(savedList.id);
    }
    playModSound('add', modConfig.soundEnabled);
  };

  const handleDeleteList = (listId: string) => {
    if (lists.length <= 1) return;
    const remainingLists = lists.filter((l) => l.id !== listId);
    setLists(remainingLists);
    setTasks((prev) => prev.filter((t) => t.listId !== listId));
    if (activeListId === listId) {
      setActiveListId(remainingLists[0].id);
    }
    playModSound('click', modConfig.soundEnabled);
  };

  const handleRestoreBackup = (backup: WorkspaceBackup) => {
    setLists(backup.lists);
    setTasks(backup.tasks);
    if (backup.modConfig) {
      setModConfig(backup.modConfig);
    }
    setActiveListId(backup.lists[0]?.id ?? 'all');
  };

  const patternClass = `bg-pattern-${modConfig.texture}`;
  const hasActiveFilters =
    statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div
      className={`min-h-screen flex ${patternClass}`}
      style={{
        backgroundColor: 'var(--mod-bg)',
        color: 'var(--mod-text)',
      }}
    >
      <Sidebar
        lists={lists}
        tasks={tasks}
        activeListId={activeListId}
        onSelectList={(id) => {
          setActiveListId(id);
          playModSound('click', modConfig.soundEnabled);
        }}
        onCreateList={() => setListModalState({ isOpen: true, editingList: null })}
        onEditList={(list) => setListModalState({ isOpen: true, editingList: list })}
        onOpenMods={() => setIsModsOpen(true)}
        onOpenInstallExport={() => setIsInstallExportOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          activeListName={activeList ? activeList.name : 'All Activities'}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenMods={() => setIsModsOpen(true)}
          onOpenInstallExport={() => setIsInstallExportOpen(true)}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Active List Header & Progress */}
            <section
              aria-labelledby="active-list-heading"
              className="border p-5 sm:p-6 space-y-4"
              style={{
                backgroundColor: 'var(--mod-surface)',
                borderColor: 'var(--mod-border)',
                borderRadius: 'var(--mod-radius)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    {activeList && (
                      <span
                        className="flex h-8 w-8 items-center justify-center shrink-0"
                        style={{
                          borderRadius: 'var(--mod-radius-sm)',
                          backgroundColor: 'var(--mod-accent-soft)',
                          color: 'var(--mod-accent)',
                        }}
                      >
                        <ListIcon name={activeList.iconName} className="h-4 w-4" />
                      </span>
                    )}
                    <h1
                      id="active-list-heading"
                      className="font-display text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]"
                    >
                      {activeList ? activeList.name : 'All Activities'}
                    </h1>
                  </div>
                  <p className="text-sm max-w-2xl" style={{ color: 'var(--mod-text-muted)' }}>
                    {activeList
                      ? activeList.description ||
                        'Organize tasks, locations, and sub-steps in this activity list.'
                      : 'Combined view across every gaming quest, household chore, seasonal prep, and personal goal.'}
                  </p>
                </div>

                {activeList && (
                  <button
                    type="button"
                    onClick={() =>
                      setListModalState({ isOpen: true, editingList: activeList })
                    }
                    className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium self-start whitespace-nowrap shrink-0 transition-colors hover:opacity-90"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                      color: 'var(--mod-text-muted)',
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Customize List
                  </button>
                )}
              </div>

              {/* Progress Bar & Tabular Summary */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                  <span style={{ color: 'var(--mod-text-muted)' }}>
                    {progress.active} remaining · {progress.completed} completed ·{' '}
                    {progress.total} total
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--mod-accent)' }}>
                    {progress.percent}% complete
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    backgroundColor: 'var(--mod-surface-elevated)',
                  }}
                >
                  <div
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${progress.percent}%`,
                      backgroundColor: 'var(--mod-accent)',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Quick Add Task Composer */}
            <TaskComposer
              lists={lists}
              activeList={activeList}
              onAddTask={handleAddTask}
            />

            {/* Search, Filter & Sort Controls */}
            <section
              aria-label="Filter and sort tasks"
              className="flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Status Segmented Tabs */}
              <div
                className="inline-flex items-center gap-1 border p-1 self-start"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                }}
              >
                {(['all', 'active', 'completed'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className="px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      backgroundColor:
                        statusFilter === status ? 'var(--mod-accent)' : 'transparent',
                      color:
                        statusFilter === status
                          ? 'var(--mod-accent-fg)'
                          : 'var(--mod-text-muted)',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search, Priority, Sort, Clear Completed */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center gap-2 border px-2.5 py-1.5 w-full sm:w-52"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor: 'var(--mod-border)',
                    backgroundColor: 'var(--mod-surface)',
                  }}
                >
                  <Search
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--mod-text-muted)' }}
                    aria-hidden="true"
                  />
                  <label htmlFor="task-search-input" className="sr-only">
                    Search tasks
                  </label>
                  <input
                    id="task-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, place, tag..."
                    className="w-full bg-transparent text-xs outline-none"
                    style={{ color: 'var(--mod-text)' }}
                  />
                </div>

                <label htmlFor="priority-filter-select" className="sr-only">
                  Filter by priority
                </label>
                <select
                  id="priority-filter-select"
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value as TaskPriority | 'all')
                  }
                  className="border px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor: 'var(--mod-border)',
                    backgroundColor: 'var(--mod-surface)',
                    color: 'var(--mod-text)',
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <label htmlFor="sort-order-select" className="sr-only">
                  Sort tasks
                </label>
                <select
                  id="sort-order-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="border px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor: 'var(--mod-border)',
                    backgroundColor: 'var(--mod-surface)',
                    color: 'var(--mod-text)',
                  }}
                >
                  <option value="manual">Manual Order</option>
                  <option value="priority">Priority High–Low</option>
                  <option value="dueDate">Target Date</option>
                  <option value="newest">Recently Added</option>
                </select>

                {progress.completed > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:opacity-90"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                      backgroundColor: 'var(--mod-surface)',
                      color: 'var(--mod-text-muted)',
                    }}
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear Done
                  </button>
                )}
              </div>
            </section>

            {/* Task List */}
            <section aria-label="Tasks" data-testid="task-list" className="space-y-2.5">
              {visibleTasks.length === 0 ? (
                <div
                  className="border border-dashed px-6 py-12 text-center space-y-3"
                  style={{
                    borderRadius: 'var(--mod-radius)',
                    borderColor: 'var(--mod-border)',
                    backgroundColor: 'var(--mod-surface)',
                  }}
                >
                  <p className="text-sm font-semibold">
                    {hasActiveFilters
                      ? 'No tasks match your current filters'
                      : 'No tasks in this activity list yet'}
                  </p>
                  <p
                    className="text-xs max-w-md mx-auto"
                    style={{ color: 'var(--mod-text-muted)' }}
                  >
                    {hasActiveFilters
                      ? 'Try clearing your search query or switching back to All tasks.'
                      : 'Use the quick-add bar above to log a quest, room chore, or project step.'}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                      style={{
                        borderRadius: 'var(--mod-radius-sm)',
                        backgroundColor: 'var(--mod-accent)',
                        color: 'var(--mod-accent-fg)',
                      }}
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('quick-add-task-input')?.focus()
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                      style={{
                        borderRadius: 'var(--mod-radius-sm)',
                        backgroundColor: 'var(--mod-accent)',
                        color: 'var(--mod-accent-fg)',
                      }}
                    >
                      Add First Task
                    </button>
                  )}
                </div>
              ) : (
                visibleTasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    list={listMap.get(task.listId)}
                    allLists={lists}
                    showListName={activeListId === 'all'}
                    density={modConfig.density}
                    canReorder={sortOrder === 'manual' && !searchQuery.trim()}
                    isFirst={index === 0}
                    isLast={index === visibleTasks.length - 1}
                    onToggleComplete={handleToggleComplete}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                  />
                ))
              )}
            </section>

            {/* Footer */}
            <footer
              className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 pb-8 text-xs"
              style={{
                borderColor: 'var(--mod-border)',
                color: 'var(--mod-text-muted)',
              }}
            >
              <span>Saved locally on this device · Works offline</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModsOpen(true)}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: 'var(--mod-text)' }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Customize Appearance
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstallExportOpen(true)}
                  className="hover:underline"
                  style={{ color: 'var(--mod-text)' }}
                >
                  Download / Install
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Undo Toast */}
      {undoSnapshot && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 border px-4 py-2.5 text-xs shadow-xl"
          style={{
            borderRadius: 'var(--mod-radius-sm)',
            backgroundColor: 'var(--mod-surface-elevated)',
            borderColor: 'var(--mod-border)',
            color: 'var(--mod-text)',
          }}
        >
          <span>{undoSnapshot.message}</span>
          <button
            type="button"
            onClick={() => {
              setTasks(undoSnapshot.previousTasks);
              setUndoSnapshot(null);
            }}
            className="inline-flex items-center gap-1 font-semibold hover:underline"
            style={{ color: 'var(--mod-accent)' }}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Undo
          </button>
        </div>
      )}

      {/* Drawers & Modals */}
      <ModStudioDrawer
        isOpen={isModsOpen}
        onClose={() => setIsModsOpen(false)}
        modConfig={modConfig}
        tokens={themeTokens}
        onChangeMod={setModConfig}
      />

      <ListModal
        isOpen={listModalState.isOpen}
        editingList={listModalState.editingList}
        canDelete={lists.length > 1}
        onClose={() => setListModalState({ isOpen: false, editingList: null })}
        onSave={handleSaveList}
        onDelete={handleDeleteList}
      />

      <InstallExportModal
        isOpen={isInstallExportOpen}
        onClose={() => setIsInstallExportOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstallApp={install}
        lists={lists}
        tasks={tasks}
        modConfig={modConfig}
        onRestoreBackup={handleRestoreBackup}
      />

      <OfflineIndicator />
    </div>
  );
}
