import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAccessibleTokens,
  DEFAULT_MOD_CONFIG,
  getContrastRatio,
  normalizeHex,
} from './theme';
import {
  calculateListProgress,
  exportListsAsCsv,
  exportListsAsMarkdown,
  filterAndSortTasks,
  moveTaskOrder,
  parseWorkspaceBackup,
} from './tasks';
import { SEED_LISTS, SEED_TASKS } from '../data/seedData';

test('normalizeHex handles 3-char, 6-char, and invalid hex strings', () => {
  assert.equal(normalizeHex('#fff'), '#FFFFFF');
  assert.equal(normalizeHex('fa1e4e'), '#FA1E4E');
  assert.equal(normalizeHex('not-a-color', '#123456'), '#123456');
});

test('computeAccessibleTokens maintains WCAG AA contrast for light and dark surfaces', () => {
  const darkTokens = computeAccessibleTokens({
    ...DEFAULT_MOD_CONFIG,
    bgColor: '#0D0E12',
    surfaceColor: '#15171E',
    accentColor: '#FA1E4E',
  });
  assert.equal(darkTokens.isDarkSurface, true);
  assert.ok(darkTokens.surfaceContrastRatio >= 4.5, 'Dark surface text contrast >= 4.5');

  const lightTokens = computeAccessibleTokens({
    ...DEFAULT_MOD_CONFIG,
    bgColor: '#F4F6F9',
    surfaceColor: '#FFFFFF',
    accentColor: '#2563EB',
  });
  assert.equal(lightTokens.isDarkSurface, false);
  assert.ok(lightTokens.surfaceContrastRatio >= 4.5, 'Light surface text contrast >= 4.5');
  assert.ok(getContrastRatio('#FFFFFF', lightTokens.textColor) >= 4.5);
});

test('filterAndSortTasks filters by list, status, priority, and search query', () => {
  const gamingActive = filterAndSortTasks(SEED_TASKS, {
    listId: 'list-gaming',
    status: 'active',
    priority: 'all',
    searchQuery: '',
    sortBy: 'manual',
  });
  assert.equal(gamingActive.length, 2);
  assert.ok(gamingActive.every((t) => t.listId === 'list-gaming' && !t.completed));

  const easterEggMatch = filterAndSortTasks(SEED_TASKS, {
    listId: 'all',
    status: 'all',
    priority: 'all',
    searchQuery: 'waterfall',
    sortBy: 'manual',
  });
  assert.equal(easterEggMatch.length, 1);
  assert.equal(easterEggMatch[0].id, 'task-game-2');
});

test('calculateListProgress computes accurate completion counts and percentage', () => {
  const progress = calculateListProgress(SEED_TASKS, 'list-gaming');
  assert.equal(progress.total, 3);
  assert.equal(progress.completed, 1);
  assert.equal(progress.active, 2);
  assert.equal(progress.percent, 33);
});

test('moveTaskOrder swaps task positions cleanly within visible list', () => {
  const visible = filterAndSortTasks(SEED_TASKS, {
    listId: 'list-gaming',
    status: 'active',
    priority: 'all',
    searchQuery: '',
    sortBy: 'manual',
  }).map((t) => t.id);

  assert.deepEqual(visible, ['task-game-1', 'task-game-2']);
  const updated = moveTaskOrder(SEED_TASKS, 'task-game-2', 'up', visible);
  const after = filterAndSortTasks(updated, {
    listId: 'list-gaming',
    status: 'active',
    priority: 'all',
    searchQuery: '',
    sortBy: 'manual',
  }).map((t) => t.id);
  assert.deepEqual(after, ['task-game-2', 'task-game-1']);
});

test('export and parseWorkspaceBackup preserve lists, tasks, and modConfig', () => {
  const md = exportListsAsMarkdown(SEED_LISTS, SEED_TASKS);
  assert.ok(md.includes('## Game Quests & Secrets'));
  assert.ok(md.includes('Locate the haunted manor in Ravenwood Forest'));

  const csv = exportListsAsCsv(SEED_LISTS, SEED_TASKS);
  assert.ok(csv.startsWith('List,Title,Completed,Priority,Location,Category,Due Date,Notes'));

  const payload = JSON.stringify({
    version: 1,
    exportedAt: '2026-11-24T00:00:00.000Z',
    lists: SEED_LISTS,
    tasks: SEED_TASKS,
    modConfig: DEFAULT_MOD_CONFIG,
  });
  const parsed = parseWorkspaceBackup(payload);
  assert.ok(parsed !== null);
  assert.equal(parsed.lists.length, SEED_LISTS.length);
  assert.equal(parsed.tasks.length, SEED_TASKS.length);
  assert.equal(parseWorkspaceBackup('{"invalid": true}'), null);
});
