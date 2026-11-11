import { useEffect, useState, type ChangeEventHandler } from "react";

const DEFAULT_PLACEHOLDER = "Søk etter kunstner, verk, stil eller kategori";

type AnimatedSearchInputProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  titles: string[];
};

export function AnimatedSearchInput({ value, onChange, titles }: AnimatedSearchInputProps) {
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const availableTitles = Array.from(new Set(titles.map((title) => title.trim()).filter(Boolean)));
    if (focused || value || reducedMotion || availableTitles.length === 0) {
      setPlaceholder(DEFAULT_PLACEHOLDER);
      return;
    }

    let paintingIndex = Math.floor(Math.random() * availableTitles.length);
    let characterIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const animate = () => {
      const text = `Søk etter ${availableTitles[paintingIndex]}`;

      if (!deleting) {
        characterIndex += 1;
        setPlaceholder(text.slice(0, characterIndex));
        if (characterIndex === text.length) {
          deleting = true;
          timer = setTimeout(animate, 1500);
        } else {
          timer = setTimeout(animate, 75);
        }
      } else {
        characterIndex -= 1;
        setPlaceholder(text.slice(0, characterIndex));
        if (characterIndex === 0) {
          deleting = false;
          if (availableTitles.length > 1) {
            const previousIndex = paintingIndex;
            while (paintingIndex === previousIndex) paintingIndex = Math.floor(Math.random() * availableTitles.length);
          }
          timer = setTimeout(animate, 400);
        } else {
          timer = setTimeout(animate, 35);
        }
      }
    };

    timer = setTimeout(animate, 700);
    return () => clearTimeout(timer);
  }, [focused, reducedMotion, titles, value]);

  return (
    <input
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      aria-label={DEFAULT_PLACEHOLDER}
      className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-ink/80"
    />
  );
}
