import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Upload, Volume2, VolumeX, X } from 'lucide-react';
import {
  ModConfig,
  ModDensity,
  ModFontFamily,
  ModRadius,
  ModTexture,
} from '../types';
import {
  ComputedThemeTokens,
  DEFAULT_MOD_CONFIG,
  FONT_OPTIONS,
  MOD_PRESETS,
  normalizeHex,
} from '../utils/theme';

interface ModStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modConfig: ModConfig;
  tokens: ComputedThemeTokens;
  onChangeMod: (next: ModConfig) => void;
}

const ACCENT_SWATCHES = ['#FA1E4E', '#2563EB', '#10B981', '#D97706', '#8B5CF6', '#EC4899', '#0EA5E9'];

export const ModStudioDrawer: React.FC<ModStudioDrawerProps> = ({
  isOpen,
  onClose,
  modConfig,
  tokens,
  onChangeMod,
}) => {
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePresetClick = (presetId: string) => {
    const preset = MOD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChangeMod({
      presetId: preset.id,
      ...preset.config,
    });
  };

  const updateField = <K extends keyof ModConfig>(key: K, value: ModConfig[K]) => {
    onChangeMod({
      ...modConfig,
      presetId: 'custom',
      [key]: value,
    });
  };

  const handleExportMod = () => {
    const blob = new Blob([JSON.stringify(modConfig, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questlist-mod-${modConfig.presetId || 'custom'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<ModConfig>;
        if (!parsed.bgColor || !parsed.surfaceColor || !parsed.accentColor) {
          setImportError('Invalid mod file: missing color fields.');
          return;
        }
        onChangeMod({
          ...DEFAULT_MOD_CONFIG,
          ...parsed,
          presetId: parsed.presetId || 'custom',
          bgColor: normalizeHex(parsed.bgColor, DEFAULT_MOD_CONFIG.bgColor),
          surfaceColor: normalizeHex(parsed.surfaceColor, DEFAULT_MOD_CONFIG.surfaceColor),
          accentColor: normalizeHex(parsed.accentColor, DEFAULT_MOD_CONFIG.accentColor),
        });
        setImportError('');
      } catch {
        setImportError('Could not parse JSON mod file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-studio-title"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l shadow-2xl"
        style={{
          backgroundColor: 'var(--mod-surface)',
          borderColor: 'var(--mod-border)',
          color: 'var(--mod-text)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--mod-border)' }}
        >
          <div>
            <h2 id="mod-studio-title" className="font-display text-base font-bold">
              Website Mods & Appearance
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--mod-text-muted)' }}>
              Customize colors, fonts, scale, layout texture, and tactile audio live.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close website mods panel"
            className="rounded p-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--mod-text-muted)', outlineColor: 'var(--mod-accent)' }}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Presets */}
          <section aria-labelledby="mods-presets-heading" className="space-y-2.5">
            <h3
              id="mods-presets-heading"
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Mod Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {MOD_PRESETS.map((preset) => {
                const isSelected = modConfig.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset.id)}
                    className="flex items-center justify-between border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: isSelected ? 'var(--mod-accent)' : 'var(--mod-border)',
                      backgroundColor: isSelected
                        ? 'var(--mod-accent-soft)'
                        : 'var(--mod-surface-elevated)',
                      outlineColor: 'var(--mod-accent)',
                    }}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-semibold">{preset.name}</div>
                      <div
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'var(--mod-text-muted)' }}
                      >
                        {preset.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                      <span
                        className="h-4 w-4 border"
                        style={{
                          borderRadius: '3px',
                          backgroundColor: preset.config.bgColor,
                          borderColor: 'var(--mod-border)',
                        }}
                      />
                      <span
                        className="h-4 w-4 border"
                        style={{
                          borderRadius: '3px',
                          backgroundColor: preset.config.accentColor,
                          borderColor: 'var(--mod-border)',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Colors */}
          <section aria-labelledby="mods-colors-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3
                id="mods-colors-heading"
                className="text-xs font-semibold tracking-wide"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                Color Palette
              </h3>
              <span className="tabular-nums text-xs" style={{ color: 'var(--mod-text-muted)' }}>
                Contrast {tokens.surfaceContrastRatio}:1
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Background Color */}
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="mod-bg-color" className="text-xs font-medium">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="mod-bg-color"
                    type="color"
                    value={tokens.bgColor}
                    onChange={(e) => updateField('bgColor', e.target.value)}
                    className="h-8 w-10 cursor-pointer border bg-transparent p-0.5"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                    }}
                  />
                  <input
                    type="text"
                    aria-label="Background color hex code"
                    value={modConfig.bgColor}
                    onChange={(e) => updateField('bgColor', e.target.value)}
                    className="w-24 border px-2 py-1.5 font-mono text-xs uppercase outline-none"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                      backgroundColor: 'var(--mod-surface-elevated)',
                      color: 'var(--mod-text)',
                    }}
                  />
                </div>
              </div>

              {/* Card / Panel Surface Color */}
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="mod-surface-color" className="text-xs font-medium">
                  Panel Surface Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="mod-surface-color"
                    type="color"
                    value={tokens.surfaceColor}
                    onChange={(e) => updateField('surfaceColor', e.target.value)}
                    className="h-8 w-10 cursor-pointer border bg-transparent p-0.5"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                    }}
                  />
                  <input
                    type="text"
                    aria-label="Panel surface color hex code"
                    value={modConfig.surfaceColor}
                    onChange={(e) => updateField('surfaceColor', e.target.value)}
                    className="w-24 border px-2 py-1.5 font-mono text-xs uppercase outline-none"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      borderColor: 'var(--mod-border)',
                      backgroundColor: 'var(--mod-surface-elevated)',
                      color: 'var(--mod-text)',
                    }}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="mod-accent-color" className="text-xs font-medium">
                    Accent Highlight
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="mod-accent-color"
                      type="color"
                      value={tokens.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="h-8 w-10 cursor-pointer border bg-transparent p-0.5"
                      style={{
                        borderRadius: 'var(--mod-radius-sm)',
                        borderColor: 'var(--mod-border)',
                      }}
                    />
                    <input
                      type="text"
                      aria-label="Accent color hex code"
                      value={modConfig.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="w-24 border px-2 py-1.5 font-mono text-xs uppercase outline-none"
                      style={{
                        borderRadius: 'var(--mod-radius-sm)',
                        borderColor: 'var(--mod-border)',
                        backgroundColor: 'var(--mod-surface-elevated)',
                        color: 'var(--mod-text)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  {ACCENT_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`Set accent color to ${hex}`}
                      onClick={() => updateField('accentColor', hex)}
                      className="h-6 w-6 border transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: hex,
                        borderColor:
                          tokens.accentColor === hex
                            ? 'var(--mod-text)'
                            : 'var(--mod-border)',
                        outlineColor: 'var(--mod-accent)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section aria-labelledby="mods-typography-heading" className="space-y-3">
            <h3
              id="mods-typography-heading"
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Typography & Scale
            </h3>

            <div>
              <label htmlFor="mod-font-family" className="block text-xs font-medium mb-1.5">
                Interface Font Family
              </label>
              <select
                id="mod-font-family"
                value={modConfig.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value as ModFontFamily)}
                className="w-full border px-3 py-2 text-xs outline-none"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                  color: 'var(--mod-text)',
                }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label} — {f.sample}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="mod-font-size" className="text-xs font-medium">
                  Base Font Size
                </label>
                <span className="tabular-nums font-mono text-xs" style={{ color: 'var(--mod-accent)' }}>
                  {modConfig.fontSizePx}px
                </span>
              </div>
              <input
                id="mod-font-size"
                type="range"
                min={13}
                max={18}
                step={1}
                value={modConfig.fontSizePx}
                onChange={(e) => updateField('fontSizePx', Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--mod-accent)]"
              />
              <div
                className="flex justify-between text-xs mt-1 tabular-nums"
                style={{ color: 'var(--mod-text-muted)' }}
              >
                <span>13px</span>
                <span>15px</span>
                <span>18px</span>
              </div>
            </div>
          </section>

          {/* Shape, Density & Background Texture */}
          <section aria-labelledby="mods-layout-heading" className="space-y-3">
            <h3
              id="mods-layout-heading"
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Geometry & Texture
            </h3>

            {/* Corner Radius */}
            <div>
              <span className="block text-xs font-medium mb-1.5">Corner Style</span>
              <div
                className="grid grid-cols-3 gap-1 p-1 border"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                {(['sharp', 'balanced', 'soft'] as ModRadius[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateField('radius', r)}
                    className="py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      backgroundColor:
                        modConfig.radius === r ? 'var(--mod-accent)' : 'transparent',
                      color:
                        modConfig.radius === r
                          ? 'var(--mod-accent-fg)'
                          : 'var(--mod-text-muted)',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <span className="block text-xs font-medium mb-1.5">Row Density</span>
              <div
                className="grid grid-cols-3 gap-1 p-1 border"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                {(['compact', 'comfortable', 'spacious'] as ModDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateField('density', d)}
                    className="py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      backgroundColor:
                        modConfig.density === d ? 'var(--mod-accent)' : 'transparent',
                      color:
                        modConfig.density === d
                          ? 'var(--mod-accent-fg)'
                          : 'var(--mod-text-muted)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Texture */}
            <div>
              <span className="block text-xs font-medium mb-1.5">Canvas Background Pattern</span>
              <div
                className="grid grid-cols-4 gap-1 p-1 border"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  backgroundColor: 'var(--mod-surface-elevated)',
                }}
              >
                {(['solid', 'grid', 'dots', 'diagonal'] as ModTexture[]).map((tex) => (
                  <button
                    key={tex}
                    type="button"
                    onClick={() => updateField('texture', tex)}
                    className="py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap"
                    style={{
                      borderRadius: 'var(--mod-radius-sm)',
                      backgroundColor:
                        modConfig.texture === tex ? 'var(--mod-accent)' : 'transparent',
                      color:
                        modConfig.texture === tex
                          ? 'var(--mod-accent-fg)'
                          : 'var(--mod-text-muted)',
                    }}
                  >
                    {tex}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {modConfig.soundEnabled ? (
                  <Volume2 className="h-4 w-4" style={{ color: 'var(--mod-accent)' }} aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" style={{ color: 'var(--mod-text-muted)' }} aria-hidden="true" />
                )}
                <span className="text-xs font-medium">Tactile Sound Effects</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={modConfig.soundEnabled}
                onClick={() => updateField('soundEnabled', !modConfig.soundEnabled)}
                className="border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: modConfig.soundEnabled
                    ? 'var(--mod-accent)'
                    : 'var(--mod-border)',
                  backgroundColor: modConfig.soundEnabled
                    ? 'var(--mod-accent-soft)'
                    : 'transparent',
                  color: modConfig.soundEnabled
                    ? 'var(--mod-accent)'
                    : 'var(--mod-text-muted)',
                }}
              >
                {modConfig.soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </section>

          {/* Share / Import Mod */}
          <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--mod-border)' }}>
            <h3
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--mod-text-muted)' }}
            >
              Mod Profile Backup
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportMod}
                className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export Mod
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                }}
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Load Mod File
              </button>

              <button
                type="button"
                onClick={() => onChangeMod(DEFAULT_MOD_CONFIG)}
                className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                style={{
                  borderRadius: 'var(--mod-radius-sm)',
                  borderColor: 'var(--mod-border)',
                  color: 'var(--mod-text-muted)',
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportMod}
                className="hidden"
              />
            </div>
            {importError && (
              <p className="text-xs" style={{ color: 'var(--mod-accent)' }}>
                {importError}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
