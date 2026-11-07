import { Search, X } from "lucide-react";

export function SearchField({
  value,
  onChange,
  placeholder,
  label = "Rechercher",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="glass flex min-h-12 items-center gap-2 px-3">
      <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        className="search-input min-h-11"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        enterKeyHint="search"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        type="search"
      />
      {value ? (
        <button
          type="button"
          className="pressable grid size-11 place-items-center rounded-full text-muted"
          aria-label="Effacer la recherche"
          onClick={() => onChange("")}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      ) : null}
    </label>
  );
}

export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-full bg-segment p-1" role="group">
      {options.map((option) => {
        const pressed = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(option.id)}
            className={
              "pressable min-h-11 flex-1 rounded-full px-3 text-sm font-semibold " +
              (pressed ? "bg-primary text-primary-fg" : "text-muted")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
