import {
  ActivityTemplate,
  CustomFieldLabels,
  ModConfig,
  SortOrder,
  StatusFilter,
  TaskItem,
  TaskPriority,
  TodoList,
  WorkspaceBackup,
} from '../types';

export function getTemplateDefaults(template: ActivityTemplate): CustomFieldLabels {
  switch (template) {
    case 'gaming':
      return {
        locationLabel: 'Location / Map Zone',
        locationPlaceholder: 'e.g. Ravenwood Manor · Behind Waterfall',
        categoryLabel: 'Game / Quest Type',
        categoryPlaceholder: 'e.g. Elden Ring · Easter Egg',
        categorySuggestions: [
          'Easter Egg',
          'Haunted Location',
          'Main Quest',
          'Secret Loot',
          'Boss / Challenge',
          'Achievement',
        ],
      };
    case 'daily':
      return {
        locationLabel: 'Room / Area',
        locationPlaceholder: 'e.g. Kitchen, Living Room, Garage',
        categoryLabel: 'Routine / Cadence',
        categoryPlaceholder: 'e.g. Daily Chore, Deep Clean',
        categorySuggestions: [
          'Daily Chore',
          'Weekly Reset',
          'Errand',
          'Maintenance',
          'Groceries',
        ],
      };
    case 'seasonal':
      return {
        locationLabel: 'Decor / Prep Zone',
        locationPlaceholder: 'e.g. Front Porch, Mantle, Tree',
        categoryLabel: 'Event / Prep Type',
        categoryPlaceholder: 'e.g. Christmas Lights, Gifts',
        categorySuggestions: [
          'Decorating',
          'Lighting',
          'Gifts & Wrapping',
          'Cooking & Hosting',
          'Supplies',
        ],
      };
    case 'work':
      return {
        locationLabel: 'Project / Context',
        locationPlaceholder: 'e.g. Q4 Launch, Study Module 3',
        categoryLabel: 'Track / Focus',
        categoryPlaceholder: 'e.g. Deep Work, Review',
        categorySuggestions: ['Deep Work', 'Meeting', 'Reading', 'Admin', 'Deliverable'],
      };
    case 'custom':
    default:
      return {
        locationLabel: 'Location / Context',
        locationPlaceholder: 'Optional place, room, or reference',
        categoryLabel: 'Category',
        categoryPlaceholder: 'Optional sub-category or tag',
        categorySuggestions: ['Priority', 'Quick Win', 'Research', 'Follow-up'],
      };
  }
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export interface FilterTasksOptions {
  listId: string | 'all';
  status: StatusFilter;
  priority: TaskPriority | 'all';
  searchQuery: string;
  sortBy: SortOrder;
}

export function filterAndSortTasks(
  tasks: TaskItem[],
  options: FilterTasksOptions
): TaskItem[] {
  const q = options.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (options.listId !== 'all' && task.listId !== options.listId) return false;
    if (options.status === 'active' && task.completed) return false;
    if (options.status === 'completed' && !task.completed) return false;
    if (options.priority !== 'all' && task.priority !== options.priority) return false;

    if (q) {
      const haystack = [
        task.title,
        task.location,
        task.category,
        task.notes,
        ...task.subtasks.map((s) => s.title),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    // Always keep incomplete tasks above completed tasks in manual/priority/dueDate unless filtered
    if (options.status === 'all' && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    switch (options.sortBy) {
      case 'priority': {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        return a.order - b.order;
      }
      case 'dueDate': {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return a.order - b.order;
      }
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'manual':
      default:
        return a.order - b.order;
    }
  });
}

export interface ListProgress {
  total: number;
  completed: number;
  active: number;
  percent: number;
}

export function calculateListProgress(tasks: TaskItem[], listId: string | 'all'): ListProgress {
  const scoped = listId === 'all' ? tasks : tasks.filter((t) => t.listId === listId);
  const total = scoped.length;
  const completed = scoped.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, active, percent };
}

export function moveTaskOrder(
  tasks: TaskItem[],
  taskId: string,
  direction: 'up' | 'down',
  visibleOrderedIds: string[]
): TaskItem[] {
  const idx = visibleOrderedIds.indexOf(taskId);
  if (idx === -1) return tasks;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= visibleOrderedIds.length) return tasks;

  const swapId = visibleOrderedIds[targetIdx];
  const taskA = tasks.find((t) => t.id === taskId);
  const taskB = tasks.find((t) => t.id === swapId);
  if (!taskA || !taskB) return tasks;

  const orderA = taskA.order;
  const orderB = taskB.order;

  return tasks.map((t) => {
    if (t.id === taskId) return { ...t, order: orderB };
    if (t.id === swapId) return { ...t, order: orderA };
    return t;
  });
}

export function createBackupPayload(
  lists: TodoList[],
  tasks: TaskItem[],
  modConfig: ModConfig
): WorkspaceBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    lists,
    tasks,
    modConfig,
  };
}

export function exportListsAsMarkdown(lists: TodoList[], tasks: TaskItem[]): string {
  const lines: string[] = [
    '# QuestList Studio Backup',
    `Exported: ${new Date().toLocaleString()}`,
    '',
  ];

  for (const list of lists) {
    const listTasks = tasks.filter((t) => t.listId === list.id).sort((a, b) => a.order - b.order);
    lines.push(`## ${list.name}`);
    if (list.description) {
      lines.push(`_${list.description}_`);
    }
    lines.push('');
    if (listTasks.length === 0) {
      lines.push('- (No tasks yet)');
    } else {
      for (const task of listTasks) {
        const mark = task.completed ? 'x' : ' ';
        const meta: string[] = [];
        if (task.location) meta.push(task.location);
        if (task.category) meta.push(task.category);
        if (task.dueDate) meta.push(`Due ${task.dueDate}`);
        if (task.priority !== 'medium') meta.push(`${task.priority} priority`);
        const suffix = meta.length > 0 ? ` (${meta.join(' · ')})` : '';
        lines.push(`- [${mark}] ${task.title}${suffix}`);
        for (const sub of task.subtasks) {
          lines.push(`  - [${sub.completed ? 'x' : ' '}] ${sub.title}`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportListsAsCsv(lists: TodoList[], tasks: TaskItem[]): string {
  const listNameById = new Map(lists.map((l) => [l.id, l.name]));
  const escapeCsv = (val: string) => {
    const safe = val.replace(/"/g, '""');
    return `"${safe}"`;
  };

  const headers = [
    'List',
    'Title',
    'Completed',
    'Priority',
    'Location',
    'Category',
    'Due Date',
    'Notes',
  ];
  const rows = tasks.map((t) =>
    [
      listNameById.get(t.listId) ?? 'General',
      t.title,
      t.completed ? 'Yes' : 'No',
      t.priority,
      t.location,
      t.category,
      t.dueDate,
      t.notes,
    ]
      .map(escapeCsv)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function parseWorkspaceBackup(rawJson: string): WorkspaceBackup | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<WorkspaceBackup>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.lists) ||
      !Array.isArray(parsed.tasks)
    ) {
      return null;
    }

    const validLists = parsed.lists.filter(
      (l): l is TodoList =>
        Boolean(l && typeof l.id === 'string' && typeof l.name === 'string')
    );
    const validTasks = parsed.tasks.filter(
      (t): t is TaskItem =>
        Boolean(
          t &&
            typeof t.id === 'string' &&
            typeof t.listId === 'string' &&
            typeof t.title === 'string'
        )
    );

    if (validLists.length === 0) return null;

    return {
      version: typeof parsed.version === 'number' ? parsed.version : 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      lists: validLists,
      tasks: validTasks,
      modConfig: parsed.modConfig as ModConfig,
    };
  } catch {
    return null;
  }
}
