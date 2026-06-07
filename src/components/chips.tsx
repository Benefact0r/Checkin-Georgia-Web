"use client";

import { useState } from "react";

export interface ChipOption {
  value: string;
  label: string;
  icon?: string;
}

/** A single pill toggle. */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-ink-200 bg-white text-ink-700 hover:border-brand dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
      }`}
    >
      {children}
    </button>
  );
}

/** A wrap of chips for multi-select, with optional search for long lists.
 *  Selected chips are pinned so they stay visible while filtering. */
export function ChipMultiSelect({
  options,
  selected,
  onChange,
  searchable = false,
  placeholder = "ძებნა…",
  max,
}: {
  options: ChipOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
  max?: number;
}) {
  const [q, setQ] = useState("");
  const sel = new Set(selected);

  const toggle = (value: string) => {
    const next = new Set(sel);
    if (next.has(value)) next.delete(value);
    else {
      if (max && next.size >= max) return;
      next.add(value);
    }
    onChange([...next]);
  };

  const needle = q.trim().toLowerCase();
  const visible = needle
    ? options.filter(
        (o) => o.label.toLowerCase().includes(needle) || sel.has(o.value),
      )
    : options;

  return (
    <div>
      {searchable && (
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="mb-3 w-full rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
        />
      )}
      <div className="flex flex-wrap gap-2">
        {visible.map((o) => (
          <Chip key={o.value} active={sel.has(o.value)} onClick={() => toggle(o.value)}>
            {o.icon ? <span className="mr-1">{o.icon}</span> : null}
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
