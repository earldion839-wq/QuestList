import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ModDensity,
  TaskItem,
  TaskPriority,
  TodoList,
} from '../types';

interface TaskRowProps {
  task: TaskItem;
  list: TodoList | undefined;
  allLists: TodoList[];
  showListName: boolean;
  density: ModDensity;
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, patch: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  list,
  allLists,
  showListName,
  density,
  canReorder,
  isFirst,
  isLast,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  const paddingClass =
    density === 'compact'
      ? 'px-3.5 py-2'
      : density === 'spacious'
      ? 'px-5 py-4'
      : 'px-4 py-3';

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const metadataParts: string[] = [];
  if (showListName && list) metadataParts.push(list.name);
  if (task.location) metadataParts.push(task.location);
  if (task.category) metadataParts.push(task.category);
  if (task.dueDate) metadataParts.push(`Due ${task.dueDate}`);
  if (task.priority === 'high') metadataParts.push('High priority');
  else if (task.priority === 'low') metadataParts.push('Low priority');
  if (task.subtasks.length > 0) {
    metadataParts.push(`${completedSubtasks}/${task.subtasks.length} steps`);
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    onUpdateTask(task.id, {
      subtasks: [
        ...task.subtasks,
        {
          id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: trimmed,
          completed: false,
        },
      ],
    });
    setSubtaskDraft('');
  };

  const handleToggleSubtask = (subId: string) => {
    onUpdateTask(task.id, {
      subtasks: task.subtasks.map((s) =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleDeleteSubtask = (subId: string) => {
    onUpdateTask(task.id, {
      subtasks: task.subtasks.filter((s) => s.id !== subId),
    });
  };

  return (
    <div
      className="border transition-colors"
      style={{
        backgroundColor: 'var(--mod-surface)',
        borderColor: 'var(--mod-border)',
        borderRadius: 'var(--mod-radius)',
        opacity: task.completed ? 0.72 : 1,
      }}
    >
      <div className={`flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3 ${paddingClass}`}>
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Accessible Checkbox Button */}
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`}
            aria-pressed={task.completed}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              borderColor: task.completed ? 'var(--mod-accent)' : 'var(--mod-border)',
              backgroundColor: task.completed ? 'var(--mod-accent)' : 'transparent',
              color: 'var(--mod-accent-fg)',
              outlineColor: 'var(--mod-accent)',
            }}
          >
            {task.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p
                className={`text-sm font-medium leading-snug break-words ${
                  task.completed ? 'line-through' : ''
                }`}
                style={{
                  color: task.completed ? 'var(--mod-text-muted)' : 'var(--mod-text)',
                }}
              >
                {task.title}
              </p>
            </div>

            {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
            {metadataParts.length > 0 && (
              <div
                className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                {metadataParts.map((part, idx) => (
                  <React.Fragment key={`${part}-${idx}`}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span
                      style={
                        part === 'High priority' && !task.completed
                          ? { color: 'var(--mod-accent)', fontWeight: 600 }
                          : undefined
                      }
                    >
                      {part}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row Controls */}
        <div className="flex items-center justify-end gap-1 shrink-0 pl-8 sm:pl-0">
          {canReorder && (
            <>
              <button
                type="button"
                onClick={() => onMoveTask(task.id, 'up')}
                disabled={isFirst}
                aria-label={`Move "${task.title}" up`}
                className="rounded p-2 sm:p-1.5 transition-opacity hover:opacity-100 disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMoveTask(task.id, 'down')}
                disabled={isLast}
                aria-label={`Move "${task.title}" down`}
                className="rounded p-2 sm:p-1.5 transition-opacity hover:opacity-100 disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Edit'} details for "${task.title}"`}
            className="rounded p-2 sm:p-1.5 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            aria-label={`Delete "${task.title}"`}
            className="rounded p-2 sm:p-1.5 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expandable Task Inspector & Subtasks */}
      {isExpanded && (
        <div
          className="border-t px-4 py-4 space-y-4"
          style={{
            borderColor: 'var(--mod-border)',
            backgroundColor: 'var(--mod-surface-elevated)',
            borderBottomLeftRadius: 'var(--mod-radius)',
            borderBottomRightRadius: 'var(--mod-radius)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor={`edit-title-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Task Title
              </label>
              <input
                id={`edit-title-${task.id}`}
                type="text"
                value={task.title}
                onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                className="w-full border px-2.5 py-1.5 text-sm outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`edit-location-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                {list?.fieldLabels.locationLabel ?? 'Location / Context'}
              </label>
              <input
                id={`edit-location-${task.id}`}
                type="text"
                value={task.location}
                onChange={(e) => onUpdateTask(task.id, { location: e.target.value })}
                placeholder={list?.fieldLabels.locationPlaceholder ?? 'Optional location'}
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`edit-category-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                {list?.fieldLabels.categoryLabel ?? 'Category'}
              </label>
              <input
                id={`edit-category-${task.id}`}
                type="text"
                value={task.category}
                onChange={(e) => onUpdateTask(task.id, { category: e.target.value })}
                placeholder={list?.fieldLabels.categoryPlaceholder ?? 'Optional category'}
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`edit-priority-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Priority
              </label>
              <select
                id={`edit-priority-${task.id}`}
                value={task.priority}
                onChange={(e) =>
                  onUpdateTask(task.id, { priority: e.target.value as TaskPriority })
                }
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`edit-due-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Target Date
              </label>
              <input
                id={`edit-due-${task.id}`}
                type="date"
                value={task.dueDate}
                onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value })}
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>

            <div>
              <label
                htmlFor={`edit-list-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Move to Activity List
              </label>
              <select
                id={`edit-list-${task.id}`}
                value={task.listId}
                onChange={(e) => onUpdateTask(task.id, { listId: e.target.value })}
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              >
                {allLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`edit-notes-${task.id}`}
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Notes & Hints
              </label>
              <textarea
                id={`edit-notes-${task.id}`}
                rows={2}
                value={task.notes}
                onChange={(e) => onUpdateTask(task.id, { notes: e.target.value })}
                placeholder="Add coordinates, hints, supply notes, or reminders..."
                className="w-full border px-2.5 py-1.5 text-xs outline-none resize-y"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold" style={{ color: 'var(--mod-text-muted)' }}>
              Checklist Steps ({completedSubtasks}/{task.subtasks.length})
            </h4>

            {task.subtasks.length > 0 && (
              <ul className="space-y-1.5">
                {task.subtasks.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 text-left min-w-0 flex-1"
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center border"
                        style={{
                          borderRadius: 'var(--mod-radius-sm)',
                          borderColor: sub.completed
                            ? 'var(--mod-accent)'
                            : 'var(--mod-border)',
                          backgroundColor: sub.completed
                            ? 'var(--mod-accent)'
                            : 'transparent',
                          color: 'var(--mod-accent-fg)',
                        }}
                      >
                        {sub.completed && <Check className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      <span
                        className={`truncate ${sub.completed ? 'line-through' : ''}`}
                        style={{
                          color: sub.completed ? 'var(--mod-text-muted)' : 'var(--mod-text)',
                        }}
                      >
                        {sub.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      aria-label={`Remove step "${sub.title}"`}
                      className="p-1 opacity-70 hover:opacity-100"
                      style={{ color: 'var(--mod-text-muted)' }}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <label htmlFor={`add-step-${task.id}`} className="sr-only">
                Add checklist step
              </label>
              <input
                id={`add-step-${task.id}`}
                type="text"
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                placeholder="Add a step (e.g. Find gate key, Test lights)..."
                className="flex-1 border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  color: 'var(--mod-text)',
                }}
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
                Add Step
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
