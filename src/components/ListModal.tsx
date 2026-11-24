import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { ActivityTemplate, TodoList } from '../types';
import { getTemplateDefaults } from '../utils/tasks';
import { LIST_ICON_OPTIONS, ListIcon } from './ListIcon';

interface ListModalProps {
  isOpen: boolean;
  editingList: TodoList | null;
  canDelete: boolean;
  onClose: () => void;
  onSave: (list: TodoList) => void;
  onDelete: (listId: string) => void;
}

const TEMPLATE_OPTIONS: { value: ActivityTemplate; label: string; hint: string }[] = [
  { value: 'gaming', label: 'Gaming & Quests', hint: 'Tracks map locations, secrets & Easter eggs' },
  { value: 'daily', label: 'Daily Life & Chores', hint: 'Tracks rooms, routines & household tasks' },
  { value: 'seasonal', label: 'Holidays & Decorating', hint: 'Tracks home zones, lights & supplies' },
  { value: 'work', label: 'Work & Study', hint: 'Tracks projects, reading & milestones' },
  { value: 'custom', label: 'Blank Custom List', hint: 'Flexible fields you label yourself' },
];

export const ListModal: React.FC<ListModalProps> = ({
  isOpen,
  editingList,
  canDelete,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<ActivityTemplate>('custom');
  const [iconName, setIconName] = useState('CheckSquare');
  const [locationLabel, setLocationLabel] = useState('Location / Context');
  const [categoryLabel, setCategoryLabel] = useState('Category');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingList) {
      setName(editingList.name);
      setDescription(editingList.description);
      setTemplate(editingList.template);
      setIconName(editingList.iconName);
      setLocationLabel(editingList.fieldLabels.locationLabel);
      setCategoryLabel(editingList.fieldLabels.categoryLabel);
    } else {
      const defaults = getTemplateDefaults('gaming');
      setName('');
      setDescription('');
      setTemplate('gaming');
      setIconName('Gamepad2');
      setLocationLabel(defaults.locationLabel);
      setCategoryLabel(defaults.categoryLabel);
    }
    setError('');
  }, [isOpen, editingList]);

  if (!isOpen) return null;

  const handleTemplateChange = (nextTemplate: ActivityTemplate) => {
    setTemplate(nextTemplate);
    const defaults = getTemplateDefaults(nextTemplate);
    setLocationLabel(defaults.locationLabel);
    setCategoryLabel(defaults.categoryLabel);
    if (!editingList) {
      if (nextTemplate === 'gaming') setIconName('Gamepad2');
      else if (nextTemplate === 'daily') setIconName('Home');
      else if (nextTemplate === 'seasonal') setIconName('Sparkles');
      else if (nextTemplate === 'work') setIconName('Briefcase');
      else setIconName('CheckSquare');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a list name.');
      return;
    }

    const templateDefaults = getTemplateDefaults(template);
    const saved: TodoList = {
      id: editingList?.id ?? `list-${Date.now()}`,
      name: trimmed,
      description: description.trim(),
      template,
      iconName,
      fieldLabels: {
        ...templateDefaults,
        locationLabel: locationLabel.trim() || templateDefaults.locationLabel,
        categoryLabel: categoryLabel.trim() || templateDefaults.categoryLabel,
      },
      createdAt: editingList?.createdAt ?? Date.now(),
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-modal-title"
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--mod-surface)',
          borderColor: 'var(--mod-border)',
          borderRadius: 'var(--mod-radius)',
          color: 'var(--mod-text)',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--mod-border)' }}
        >
          <h2 id="list-modal-title" className="font-display text-base font-bold">
            {editingList ? 'Customize Activity List' : 'Create New Activity List'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close list dialog"
            className="rounded p-1.5 hover:opacity-80"
            style={{ color: 'var(--mod-text-muted)' }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label htmlFor="list-name-input" className="block text-xs font-medium mb-1">
              List Name
            </label>
            <input
              id="list-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Skyrim Side Quests, Garage Cleanup, Christmas Gifts"
              className="w-full border px-3 py-2 text-sm outline-none"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
                backgroundColor: 'var(--mod-surface-elevated)',
                color: 'var(--mod-text)',
              }}
            />
            {error && (
              <p className="mt-1 text-xs" style={{ color: 'var(--mod-accent)' }}>
                {error}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="list-desc-input" className="block text-xs font-medium mb-1">
              Description (Optional)
            </label>
            <input
              id="list-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what belongs in this list"
              className="w-full border px-3 py-2 text-xs outline-none"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
                backgroundColor: 'var(--mod-surface-elevated)',
                color: 'var(--mod-text)',
              }}
            />
          </div>

          <div>
            <label htmlFor="list-template-select" className="block text-xs font-medium mb-1">
              Activity Preset
            </label>
            <select
              id="list-template-select"
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value as ActivityTemplate)}
              className="w-full border px-3 py-2 text-xs outline-none"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
                backgroundColor: 'var(--mod-surface-elevated)',
                color: 'var(--mod-text)',
              }}
            >
              {TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-medium mb-1.5">List Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {LIST_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setIconName(opt.name)}
                  aria-label={`Select ${opt.label} icon`}
                  aria-pressed={iconName === opt.name}
                  className="flex h-9 w-9 items-center justify-center border transition-colors"
                  style={{
                    borderRadius: 'var(--mod-radius-sm)',
                    borderColor:
                      iconName === opt.name ? 'var(--mod-accent)' : 'var(--mod-border)',
                    backgroundColor:
                      iconName === opt.name
                        ? 'var(--mod-accent-soft)'
                        : 'var(--mod-surface-elevated)',
                    color:
                      iconName === opt.name ? 'var(--mod-accent)' : 'var(--mod-text-muted)',
                  }}
                >
                  <ListIcon name={opt.name} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="list-location-label" className="block text-xs font-medium mb-1">
                Place / Location Field Name
              </label>
              <input
                id="list-location-label"
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="w-full border px-3 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>

            <div>
              <label htmlFor="list-category-label" className="block text-xs font-medium mb-1">
                Category Field Name
              </label>
              <input
                id="list-category-label"
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="w-full border px-3 py-1.5 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                  color: 'var(--mod-text)',
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between border-t px-5 py-3.5"
          style={{
            borderColor: 'var(--mod-border)',
            backgroundColor: 'var(--mod-surface-elevated)',
          }}
        >
          {editingList && canDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(editingList.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
                color: 'var(--mod-accent)',
              }}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete List
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                borderColor: 'var(--mod-border)',
                color: 'var(--mod-text-muted)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold whitespace-nowrap"
              style={{
                borderRadius: 'var(--mod-radius-sm)',
                backgroundColor: 'var(--mod-accent)',
                color: 'var(--mod-accent-fg)',
              }}
            >
              {editingList ? 'Save Changes' : 'Create List'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
