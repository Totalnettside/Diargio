import { useEffect, useId, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { searchNorwegianAddresses } from '@/lib/norwegian-address.functions';
import type { NorwegianAddressSuggestion } from '@/lib/norwegian-address';

interface NorwegianAddressInputProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSelect: (address: NorwegianAddressSuggestion) => void;
}

export function NorwegianAddressInput({ value, disabled, onChange, onSelect }: NorwegianAddressInputProps) {
  const inputId = useId();
  const listId = `${inputId}-suggestions`;
  const searchAddresses = useServerFn(searchNorwegianAddresses);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const [suggestions, setSuggestions] = useState<NorwegianAddressSuggestion[]>([]);
  const query = value.trim();

  useEffect(() => {
    if (disabled || !open || query.length < 2) {
      setSuggestions([]);
      setBusy(false);
      return;
    }
    let active = true;
    setBusy(true);
    setError('');
    const timer = window.setTimeout(() => {
      void searchAddresses({ data: { query } })
        .then((result) => {
          if (!active) return;
          setSuggestions(result.addresses);
          setHighlighted(result.addresses.length ? 0 : -1);
          setError(result.error ?? '');
        })
        .catch(() => {
          if (!active) return;
          setSuggestions([]);
          setError('Adresseoppslaget er midlertidig utilgjengelig.');
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [disabled, open, query, searchAddresses]);

  function selectSuggestion(suggestion: NorwegianAddressSuggestion) {
    onChange(suggestion.line1);
    onSelect(suggestion);
    setOpen(false);
    setSuggestions([]);
    setHighlighted(-1);
  }

  return (
    <div
      className="relative space-y-1 text-sm"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={inputId} className="block">Gateadresse</label>
      <input
        id={inputId}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        value={value}
        disabled={disabled}
        autoComplete="address-line1"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && query.length >= 2}
        aria-controls={listId}
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => {
          if (value.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setHighlighted((current) => Math.min(current + 1, suggestions.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlighted((current) => Math.max(current - 1, 0));
          } else if (event.key === 'Enter' && open && highlighted >= 0 && suggestions[highlighted]) {
            event.preventDefault();
            selectSuggestion(suggestions[highlighted]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && query.length >= 2 && (
        <div className="absolute inset-x-0 top-full z-30 pt-1">
          {(busy || suggestions.length > 0) && (
            <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
              {busy && <li className="px-3 py-2 text-muted-foreground" role="status">Henter norske adresser …</li>}
              {!busy && suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    id={`${listId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={highlighted === index}
                    className={`w-full rounded-sm px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-ring ${highlighted === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="block font-medium">{suggestion.label}</span>
                    <span className="block text-xs text-muted-foreground">{suggestion.postalCode} {suggestion.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!busy && !error && suggestions.length === 0 && (
            <p className="rounded-md border border-border bg-popover px-3 py-2 text-muted-foreground shadow-lg" role="status">Ingen adresser funnet. Fortsett å skrive, eller fyll inn manuelt.</p>
          )}
          {error && (
            <p className="rounded-md border border-border bg-popover px-3 py-2 text-muted-foreground shadow-lg" role="status">{error} Du kan skrive adressen manuelt.</p>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Adresseforslag fra Kartverket. Du kan også skrive adressen manuelt.</p>
    </div>
  );
}
