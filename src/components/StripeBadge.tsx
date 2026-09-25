export function StripeBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-[#635BFF] px-2.5 py-1 ${className}`}
      title="Sikker betaling med Stripe"
    >
      <span className="text-[10px] font-medium text-white/90">Sikker betaling med</span>
      <svg viewBox="0 0 60 25" className="h-3.5 w-auto" aria-label="Stripe" role="img">
        <text
          x="0"
          y="19"
          fill="#fff"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="20"
          fontWeight="bold"
          fontStyle="italic"
          letterSpacing="-1"
        >
          stripe
        </text>
      </svg>
    </span>
  );
}
