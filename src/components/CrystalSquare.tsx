import type { CrystalColor } from '@/engine/gameEngine';

export const CRYSTAL_STYLES: Record<CrystalColor, string> = {
  'żółty': 'bg-amber-400 border-amber-600',
  'czerwony': 'bg-red-500 border-red-700',
  'niebieski': 'bg-blue-500 border-blue-700',
  'zielony': 'bg-emerald-500 border-emerald-700',
};

interface CrystalSquareProps {
  color: CrystalColor;
  size?: 'sm' | 'md';
  onClick?: () => void;
  title?: string;
}

export function CrystalSquare({ color, size = 'md', onClick, title }: CrystalSquareProps) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-7 w-7';
  const interactive = onClick
    ? 'cursor-pointer transition-transform hover:scale-110 hover:-translate-y-0.5'
    : '';

  return (
    <span
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title ?? color}
      className={`inline-block rotate-45 rounded-sm border shadow-sm ${sizeClass} ${CRYSTAL_STYLES[color]} ${interactive}`}
    />
  );
}

interface CrystalRowProps {
  crystals: CrystalColor[];
  capacity?: number;
  emptyLabel?: string;
}

/** Renderuje wiersz kryształów jako różnokolorowe kwadraty, z opcjonalnymi pustymi slotami. */
export function CrystalRow({ crystals, capacity, emptyLabel = 'pusto' }: CrystalRowProps) {
  const emptySlots =
    capacity !== undefined ? Math.max(0, capacity - crystals.length) : 0;

  if (crystals.length === 0 && emptySlots === 0) {
    return <span className="text-sm italic text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {crystals.map((color, idx) => (
        <CrystalSquare key={`c-${idx}`} color={color} />
      ))}
      {Array.from({ length: emptySlots }).map((_, idx) => (
        <span
          key={`e-${idx}`}
          className="inline-block h-7 w-7 rotate-45 rounded-sm border border-dashed border-slate-300"
        />
      ))}
    </div>
  );
}
