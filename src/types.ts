export type ActivityTemplate = 'gaming' | 'daily' | 'seasonal' | 'work' | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high';

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortOrder = 'manual' | 'priority' | 'dueDate' | 'newest';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  /** Context-specific place/location (e.g. "Ravenwood Manor", "Living Room", "Front Porch") */
  location: string;
  /** Context-specific category or game/project name (e.g. "Easter Egg", "Elden Ring", "Weekly Chore") */
  category: string;
  dueDate: string;
  notes: string;
  subtasks: Subtask[];
  createdAt: number;
  completedAt: number | null;
  order: number;
}

export interface CustomFieldLabels {
  locationLabel: string;
  locationPlaceholder: string;
  categoryLabel: string;
  categoryPlaceholder: string;
  categorySuggestions: string[];
}

export interface TodoList {
  id: string;
  name: string;
  description: string;
  template: ActivityTemplate;
  iconName: string;
  fieldLabels: CustomFieldLabels;
  createdAt: number;
}

export type ModFontFamily =
  | 'Plus Jakarta Sans'
  | 'Outfit'
  | 'Bricolage Grotesque'
  | 'DM Sans'
  | 'JetBrains Mono';

export type ModDensity = 'compact' | 'comfortable' | 'spacious';

export type ModRadius = 'sharp' | 'balanced' | 'soft';

export type ModTexture = 'solid' | 'grid' | 'dots' | 'diagonal';

export interface ModConfig {
  presetId: string;
  bgColor: string;
  surfaceColor: string;
  accentColor: string;
  fontFamily: ModFontFamily;
  fontSizePx: number;
  radius: ModRadius;
  density: ModDensity;
  texture: ModTexture;
  soundEnabled: boolean;
}

export interface ModPreset {
  id: string;
  name: string;
  description: string;
  config: Omit<ModConfig, 'presetId'>;
}

export interface WorkspaceBackup {
  version: number;
  exportedAt: string;
  lists: TodoList[];
  tasks: TaskItem[];
  modConfig: ModConfig;
}
