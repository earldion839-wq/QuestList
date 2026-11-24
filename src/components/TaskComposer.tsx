import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { TaskPriority, TodoList } from '../types';

export interface NewTaskDraft {
  listId: string;
  title: string;
  location: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
}

interface TaskComposerProps {
  lists: TodoList[];
  activeList: TodoList | null;
  onAddTask: (draft: NewTaskDraft) => void;
}

export const TaskComposer: React.FC<TaskComposerProps> = ({
  lists,
  activeList,
  onAddTask,
}) => {
  const defaultList = activeList ?? lists[0];
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [targetListId, setTargetListId] = useState<string>(defaultList?.id ?? '');
  const [showDetails, setShowDetails] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveList =
    activeList ?? lists.find((l) => l.id === targetListId) ?? lists[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setValidationError('Enter a task title before adding.');
      inputRef.current?.focus();
      return;
    }
    if (!effectiveList) return;

    onAddTask({
      listId: effectiveList.id,
      title: trimmed,
      location: location.trim(),
      category: category.trim(),
      priority,
      dueDate,
    });

    setTitle('');
    setLocation('');
    setCategory('');
    setPriority('medium');
    setDueDate('');
    setValidationError('');
  };

  const placeholderText = (() => {
    switch (effectiveList?.template) {
      case 'gaming':
        return 'Add a quest, haunted house location, or hidden Easter egg...';
      case 'daily':
        return 'Add a daily chore, room reset, or household errand...';
      case 'seasonal':
        return 'Add a decorating step, light check, or gift prep task...';
      default:
        return 'Add a new task and press Enter...';
    }
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="border transition-colors"
      style={{
        backgroundColor: 'var(--mod-surface)',
        borderColor: 'var(--mod-border)',
        borderRadius: 'var(--mod-radius)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3">
        <div className="flex-1 min-w-0">
          <label htmlFor="quick-add-task-input" className="sr-only">
            New task title
          </label>
          <input
            ref={inputRef}
            id="quick-add-task-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder={placeholderText}
            className="w-full bg-transparent px-2.5 py-2 text-sm outline-none placeholder:opacity-60"
            style={{ color: 'var(--mod-text)' }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
            className="inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              borderColor: 'var(--mod-border)',
              color: 'var(--mod-text-muted)',
              outlineColor: 'var(--mod-accent)',
            }}
          >
            {showDetails ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>Details</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0"
            style={{
              borderRadius: 'var(--mod-radius-sm)',
              backgroundColor: 'var(--mod-accent)',
              color: 'var(--mod-accent-fg)',
              outlineColor: 'var(--mod-accent)',
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {validationError && (
        <p className="px-5 pb-2.5 text-xs font-medium" style={{ color: 'var(--mod-accent)' }}>
          {validationError}
        </p>
      )}

      {showDetails && effectiveList && (
        <div
          className="border-t px-4 py-3.5 space-y-3"
          style={{
            borderColor: 'var(--mod-border)',
            backgroundColor: 'var(--mod-surface-elevated)',
            borderBottomLeftRadius: 'var(--mod-radius)',
            borderBottomRightRadius: 'var(--mod-radius)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {!activeList && (
              <div>
                <label
                  htmlFor="composer-target-list"
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--mod-text-muted)' }}
                >
                  Activity List
                </label>
                <select
                  id="composer-target-list"
                  value={effectiveList.id}
                  onChange={(e) => setTargetListId(e.target.value)}
                  className="w-full border px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor: 'var(--mod-border)',
                    backgroundColor: 'var(--mod-surface)',
                    color: 'var(--mod-text)',
                  }}
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="composer-location"
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                {effectiveList.fieldLabels.locationLabel}
              </label>
              <input
                id="composer-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={effectiveList.fieldLabels.locationPlaceholder}
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
                htmlFor="composer-category"
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                {effectiveList.fieldLabels.categoryLabel}
              </label>
              <input
                id="composer-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={effectiveList.fieldLabels.categoryPlaceholder}
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
                htmlFor="composer-priority"
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Priority
              </label>
              <select
                id="composer-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                htmlFor="composer-due-date"
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Target Date
              </label>
              <input
                id="composer-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border px-2.5 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>
          </div>

          {effectiveList.fieldLabels.categorySuggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs mr-1" style={{ color: 'var(--mod-text-muted)' }}>
                Quick fill:
              </span>
              {effectiveList.fieldLabels.categorySuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setCategory(suggestion)}
                  className="border px-2 py-1 text-xs transition-colors hover:opacity-90 whitespace-nowrap shrink-0"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor:
                      category === suggestion ? 'var(--mod-accent)' : 'var(--mod-border)',
                    color:
                      category === suggestion ? 'var(--mod-accent)' : 'var(--mod-text-muted)',
                    backgroundColor:
                      category === suggestion ? 'var(--mod-accent-soft)' : 'transparent',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
};
